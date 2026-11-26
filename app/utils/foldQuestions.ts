/**
 * Turns every `###` question on a page into a fold-out (`<FoldQuestion>`), at render time only.
 *
 * The stored page keeps its flat headings, so site search, the "On this page" list and
 * `#anchor` links still point at each question. Pages opt in with `foldQuestions: true`.
 *
 * Works on Nuxt Content's minimark body: `{ type: 'minimark', value: [node, …] }`, where a
 * node is a string or `[tag, props, ...children]`. A question is an `h3` plus everything up to
 * the next `h1`–`h3`.
 */
type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

type MinimarkBody = {
  type: string
  value: MinimarkNode[]
  [key: string]: unknown
}

const tagOf = (node: MinimarkNode) => (typeof node === 'string' ? '' : node[0])

const endsQuestion = (tag: string) => tag === 'h1' || tag === 'h2' || tag === 'h3'

export const foldQuestions = <T>(body: T): T => {
  const minimark = body as unknown as MinimarkBody
  if (minimark?.type !== 'minimark' || !Array.isArray(minimark.value)) return body

  const value: MinimarkNode[] = []
  let question: [string, Record<string, unknown>, ...MinimarkNode[]] | undefined

  for (const node of minimark.value) {
    const tag = tagOf(node)
    if (tag === 'h3') {
      question = ['fold-question', {}, ['template', { 'v-slot:question': '' }, node]]
      value.push(question)
    } else if (endsQuestion(tag)) {
      question = undefined
      value.push(node)
    } else if (question) {
      question.push(node)
    } else {
      value.push(node)
    }
  }

  return { ...minimark, value } as unknown as T
}
