import { describe, expect, it } from 'vitest'
import { foldQuestions } from '../app/utils/foldQuestions'

const h2 = (text: string) => ['h2', { id: text }, text]
const h3 = (text: string) => ['h3', { id: text }, text]
const p = (text: string) => ['p', {}, text]

describe('foldQuestions', () => {
  it('folds each h3 with the content up to the next heading', () => {
    const body = {
      type: 'minimark',
      value: [p('intro'), h2('topic'), h3('q1'), p('a1'), p('a1 more'), h3('q2'), p('a2'), h2('next'), p('loose')]
    }
    expect(foldQuestions(body).value).toEqual([
      p('intro'),
      h2('topic'),
      ['fold-question', {}, ['template', { 'v-slot:question': '' }, h3('q1')], p('a1'), p('a1 more')],
      ['fold-question', {}, ['template', { 'v-slot:question': '' }, h3('q2')], p('a2')],
      h2('next'),
      p('loose')
    ])
  })

  it('keeps h4 subheadings inside the answer', () => {
    const body = { type: 'minimark', value: [h3('q'), ['h4', { id: 'sub' }, 'sub'], p('a')] }
    expect(foldQuestions(body).value).toEqual([
      ['fold-question', {}, ['template', { 'v-slot:question': '' }, h3('q')], ['h4', { id: 'sub' }, 'sub'], p('a')]
    ])
  })

  it('leaves the original body and other formats alone', () => {
    const body = { type: 'minimark', value: [h3('q'), p('a')], toc: { links: [] } }
    const folded = foldQuestions(body)
    expect(body.value).toEqual([h3('q'), p('a')])
    expect(folded.toc).toBe(body.toc)

    const hast = { type: 'root', children: [] }
    expect(foldQuestions(hast)).toBe(hast)
  })
})
