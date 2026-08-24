const URL_PATTERN = /\bhttps?:\/\/[^\s<>"']+/gi

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Trailing punctuation that's overwhelmingly "end of sentence", not part of
// the URL itself (e.g. "see https://example.com." or "(https://example.com)"),
// trimmed off one layer at a time. ')' gets special handling instead of a
// blanket strip -- a URL can legitimately end in one, e.g. Wikipedia's
// "/wiki/Foo_(disambiguation)" -- so it's only trimmed while unbalanced
// against an earlier '(' in the same match.
function trimTrailingPunctuation(url) {
  let trimmed = url.replace(/[.,;:!?'"]+$/, '')
  while (trimmed.endsWith(')')) {
    const opens = (trimmed.match(/\(/g) || []).length
    const closes = (trimmed.match(/\)/g) || []).length
    if (closes <= opens) break
    trimmed = trimmed.slice(0, -1)
  }
  return trimmed
}

/**
 * Escape `text` for safe HTML rendering, auto-link any http(s):// URLs it
 * contains, and turn newlines into <br> so multi-line plain text (every
 * description/pin-body field this feeds is a plain <textarea>, not a rich
 * editor) still reads as multi-line once rendered via v-html.
 *
 * Always escapes first -- URL matching/trimming happens on the raw text,
 * and the only markup ever introduced is the <a> this function builds
 * itself around an escaped href/label, so there's no way for the source
 * text to inject arbitrary HTML through here.
 *
 * @param {string} text
 * @returns {string} an HTML string, safe to bind via v-html
 */
export function linkify(text) {
  if (!text) return ''
  let result = ''
  let lastIndex = 0
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = trimTrailingPunctuation(match[0])
    if (!url) continue
    result += escapeHtml(text.slice(lastIndex, match.index))
    const safeUrl = escapeHtml(url)
    result += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="underline">${safeUrl}</a>`
    lastIndex = match.index + url.length
  }
  result += escapeHtml(text.slice(lastIndex))
  return result.replace(/\n/g, '<br>')
}

/**
 * Composable wrapper around `linkify`, matching the rest of mini's
 * `useX()` convention (e.g. useDateFormat) -- linkify is also exported
 * standalone since it's a pure function some call sites (RichText.vue,
 * TruncatedText.vue's opt-in `linkify` prop) need without pulling in a
 * whole composable call.
 * @returns {Object}
 */
export function useLinkify() {
  return { linkify }
}
