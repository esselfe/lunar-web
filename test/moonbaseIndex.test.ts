import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AUTHOR_FORMAT, buildMoonbaseIndex, gitRepository, LANDED_FORMAT, parseHistory } from '../scripts/lib/moonbase-index.ts'

const fixture = (name: string) => ({ name, dir: join(import.meta.dirname, 'fixtures/moonbase', name) })
const { index, warnings } = buildMoonbaseIndex(
  [fixture('moonbase-core'), fixture('moonbase-other')],
  new Date('2026-11-22T12:00:00Z')
)
const module = (name: string) => index.modules.find(found => found.name === name)!

describe('buildMoonbaseIndex', () => {
  it('lists every module once, sorted, preferring an active module over a crater copy', () => {
    expect(index.modules.map(found => found.name)).toEqual([
      'curl', 'kcoreaddons', 'kf5', 'libressl', 'nano', 'NVIDIA', 'oldtool', 'openssl', 'rocket', 'zlib'
    ])
    expect(module('openssl')).toMatchObject({ repo: 'core', path: 'libs/openssl', version: '3.6.0' })
    expect(warnings).toContain(
      'openssl: in moonbase-core/libs/openssl and moonbase-other/crater/openssl, using moonbase-core/libs/openssl'
    )
  })

  it('merges sections across repositories and marks crater and beta modules', () => {
    expect(module('zlib').section).toBe('libs')
    expect(module('kcoreaddons')).toMatchObject({ section: 'libs', repo: 'other' })
    expect(module('oldtool')).toMatchObject({ section: 'crater', crater: true })
    expect(module('rocket')).toMatchObject({ section: 'zbeta', beta: true })
    expect(module('curl').crater).toBeUndefined()
  })

  it('reads the details, following lunar mirrors and other modules', () => {
    expect(module('curl')).toMatchObject({
      version: '8.17.0',
      short: 'Client for URLs, 8.17 series',
      description: 'curl is a command line tool for transferring data\nwith URL syntax.',
      website: 'https://curl.se',
      source: 'https://curl.se/download/curl-8.17.0.tar.xz',
      entered: '2002-01-15',
      updated: '2026-11-05',
      questions: [{ question: 'Enable IPv6 support?', default: true }],
      patches: 2,
      systemd: true
    })
    expect(module('kcoreaddons')).toMatchObject({
      version: '5.116.0',
      source: 'https://download.kde.org/stable/frameworks/5.116/kcoreaddons-5.116.0.tar.xz'
    })
    expect(module('zlib').source).toBe('https://downloads.sourceforge.net/sourceforge/libpng/zlib-1.3.1.tar.xz')
  })

  it('finds a module that has only a DETAILS.x86_64, as lunar does', () => {
    expect(module('NVIDIA')).toMatchObject({ repo: 'other', path: 'driver/NVIDIA', section: 'driver', version: '620.73.04' })
  })

  it('leaves out a website that is not a URL, with a warning', () => {
    expect(module('libressl').website).toBeNull()
    expect(warnings).toContain('libressl: WEB_SITE "http:/www.libressl.org" is not a URL')
  })

  it('merges aliases, earlier repositories first', () => {
    expect(index.aliases).toEqual({ '%SSL': ['openssl', 'libressl', 'wolfssl'], '%ZLIB': ['zlib'] })
  })

  it('lists dependencies and marks ones that are not in the moonbase', () => {
    expect(module('curl').depends).toEqual([
      { module: '%SSL' },
      { module: 'nghttp2', missing: true },
      { module: 'zlib', optional: { description: 'for compressed transfers', default: true } },
      { module: 'rocket', conditional: true }
    ])
  })

  it('lists dependents, also through the aliases a module provides', () => {
    expect(module('openssl').dependents).toEqual([
      { module: 'curl', via: '%SSL' },
      { module: 'nano', optional: true, via: '%SSL' }
    ])
    expect(module('libressl').dependents).toEqual(module('openssl').dependents)
    expect(module('zlib').dependents).toEqual([{ module: 'curl', optional: true }])
    expect(module('curl').dependents).toEqual([{ module: 'rocket' }])
  })

  it('counts what a module brings along: required dependencies, recursively, an alias as its first provider', () => {
    expect(module('curl').bringsAlong).toBe(1) // openssl; not zlib (optional), rocket (conditional) or nghttp2 (missing)
    expect(module('rocket').bringsAlong).toBe(2) // curl, openssl
    expect(module('kcoreaddons').bringsAlong).toBe(1)
    expect(module('nano').bringsAlong).toBe(0)
  })

  it('has no history or commits for plain folders', () => {
    expect(module('curl')).toMatchObject({ lastChange: null, history: [] })
    expect(index.repositories).toEqual([
      { name: 'moonbase-core', commit: '', date: '' },
      { name: 'moonbase-other', commit: '', date: '' }
    ])
    expect(index.generatedAt).toBe('2026-11-22T12:00:00.000Z')
  })
})

describe('parseHistory', () => {
  // What `git log --format=AUTHOR_FORMAT` and `--first-parent … --format=LANDED_FORMAT` print
  const author = (sha: string, name: string, email: string, subject: string, coAuthors = '') =>
    `\x1e${sha}\x1f${name}\x1f${email}\x1f${subject}\x1f${coAuthors}\n`
  const landed = (sha: string, parents: string, date: string, files: string[]) =>
    `\x1e${sha}\x1f${parents}\x1f${date}\n\n${files.join('\n')}\n`

  const authorLog = [
    author('m2', 'Maintainer', 'boss@example.org', 'Merge pull request #12 from someone/curl'),
    author('p2', 'Lunar Bot', 'bot@lunar-linux.org', 'curl: version bumped to 8.17.0', 'Co-authored-by: Jane Doe <jane@example.org>'),
    author('d1', 'Joe', 'joe@example.org', 'curl: fix the build'),
    author('d0', 'Joe', 'joe@example.org', 'curl: Bump to 8.16.0.'),
    author('z1', 'Ann', 'ann@example.org', 'zlib: version bumped to 1.3.1')
  ].join('')
  const landedLog = [
    landed('m2', 'd1 p2', '2026-11-21T16:58:38+01:00', ['web/curl/DETAILS']),
    landed('d1', 'd0', '2026-11-01T10:00:00Z', ['web/curl/BUILD', 'web/curl/patch.d/01.patch']),
    landed('d0', 'z1', '2026-10-01T10:00:00Z', ['web/curl/DETAILS']),
    landed('z1', '', '2026-09-01T10:00:00Z', ['libs/zlib/DETAILS', 'README'])
  ].join('')

  // What `git log … -G VERSION= -p --unified=0` prints for the commits that changed a version
  const diff = (file: string, version: string) =>
    `diff --git a/${file} b/${file}\nindex 1..2 100644\n--- a/${file}\n+++ b/${file}\n@@ -2 +2 @@\n-         VERSION=old\n+         VERSION=${version}\n`
  const versionLog = [
    `\x1e${'m2'}\x1f${'d1 p2'}\x1f2026-11-21T16:58:38+01:00\n\n${diff('web/curl/DETAILS', '8.17.0')}${diff('web/curl/DETAILS.x86_64', '8.17.0')}`,
    `\x1e${'d0'}\x1f${'z1'}\x1f2026-10-01T10:00:00Z\n\n${diff('web/curl/DETAILS', '8.16.1')}`,
    `\x1e${'z1'}\x1f\x1f2026-09-01T10:00:00Z\n\n${diff('libs/zlib/DETAILS', '$(module_version zlib-ng)')}`
  ].join('')

  const history = parseHistory(authorLog, landedLog, ['web/curl', 'libs/zlib'], versionLog)

  it('dates a merge when it landed and credits the pull request, or a bot\'s co-author', () => {
    expect(history.get('web/curl')!.lastChange).toEqual({
      commit: 'm2',
      date: '2026-11-21T15:58:38.000Z',
      author: 'Jane Doe',
      subject: 'curl: version bumped to 8.17.0'
    })
  })

  it('takes versions from what the commit wrote, once per commit, newest first', () => {
    // d0's subject says 8.16.0, but it wrote 8.16.1 (like "cmake: Bump to 4.4.1." setting 4.4.3)
    expect(history.get('web/curl')!.history).toEqual([
      { commit: 'm2', date: '2026-11-21T15:58:38.000Z', author: 'Jane Doe', version: '8.17.0' },
      { commit: 'd0', date: '2026-10-01T10:00:00.000Z', author: 'Joe', version: '8.16.1' }
    ])
  })

  it('falls back to the subject for a computed version', () => {
    expect(history.get('libs/zlib')!.history.map(change => change.version)).toEqual(['1.3.1'])
  })

  it('uses formats git understands', () => {
    expect(AUTHOR_FORMAT).toContain('%(trailers:key=Co-authored-by')
    expect(LANDED_FORMAT).toBe('%x1e%H%x1f%P%x1f%cI')
  })
})

describe('gitRepository', () => {
  // Real git sources from moonbase DETAILS files
  it.each([
    ['git+https://github.com/docker/cli.git:v28.5.0/cli-28.5.0.tar.gz', 'https://github.com/docker/cli'],
    ['git+https://github.com/nix-community/acpi_call:8140017f9e995a8ddb57ac3036d959ff817934df', 'https://github.com/nix-community/acpi_call'],
    ['git+https://github.com/Tencent/rapidjson/rapidjson-24b5e7a8.tar.gz', 'https://github.com/Tencent/rapidjson'],
    ['git+https://github.com/sebastiencs/icons-in-terminal/', 'https://github.com/sebastiencs/icons-in-terminal'],
    ['git://github.com/adobe/brackets/', 'https://github.com/adobe/brackets'],
    ['git+https://code.qt.io/pyside/pyside-setup:tag=v6.13.0/pyside-setup-everywhere-src-6.13.0.tar.xz', 'https://code.qt.io/pyside/pyside-setup']
  ])('%s', (source, expected) => {
    expect(gitRepository(source)).toBe(expected)
  })
})
