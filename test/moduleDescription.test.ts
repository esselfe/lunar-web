import { describe, expect, it } from 'vitest'
import { moduleDescription } from '../app/utils/moduleDescription'

const firefox = { name: 'firefox', version: '160.0', short: 'A web browser from mozilla.org', lastChange: { date: '2026-11-20T10:00:00Z' } }

describe('moduleDescription', () => {
  it('names the module, says what it is, when it changed and how to install it', () => {
    expect(moduleDescription(firefox))
      .toBe('firefox 160.0 for Lunar Linux: A web browser from mozilla.org. Updated November 20, 2026; install with lin firefox.')
  })

  it('doesn\'t double a full stop at the end of the short description', () => {
    expect(moduleDescription({ ...firefox, short: 'A web browser.' })).toContain(': A web browser. Updated')
  })

  it('leaves out what it doesn\'t know', () => {
    expect(moduleDescription({ name: 'broot', version: null, short: null, lastChange: null }))
      .toBe('broot for Lunar Linux. Install with lin broot.')
  })
})
