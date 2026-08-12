export type ReadableChecklistNote = {
  id: string
  title: string
  content: string
}

/**
 * Extract the human-readable Markdown examples embedded in a checklist
 * source file. Frontmatter, Vue script setup, and component markup are
 * implementation details and must not be shown or copied as instructions.
 */
export function extractReadableChecklistNotes(source: string): ReadableChecklistNote[] {
  const notes: ReadableChecklistNote[] = []
  const blockPattern = /```markdown\s*\n([\s\S]*?)\n```/g
  let match: RegExpExecArray | null
  let index = 0

  while ((match = blockPattern.exec(source))) {
    const beforeBlock = source.slice(0, match.index)
    const tabMatches = [...beforeBlock.matchAll(/@tab\s+([^\n]+)\s*$/gm)]
    const title = tabMatches.at(-1)?.[1]?.trim() || `说明 ${index + 1}`
    const content = (match[1] || '').trim()

    if (content) {
      notes.push({
        id: `source-note-${index + 1}`,
        title,
        content,
      })
      index += 1
    }
  }

  return notes
}
