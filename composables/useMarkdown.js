import { Marked } from 'marked'
import DOMPurify from 'dompurify'

// Description/pin-body fields are guest-writable (Task/Pin, per this app's
// own "Guest project collaborators" convention) and rendered via v-html --
// a hand-rolled parser is exactly the kind of thing that quietly misses an
// edge case and becomes a real stored-XSS hole, so this leans on two small,
// widely-audited libraries instead (see plans/MARKDOWN_EDITOR_DESIGN.md §1
// in the consuming jpm repo for the full writeup). A dedicated `Marked`
// instance, not the module-level default export, so configuring it here
// can't affect some *other* unrelated use of `marked` a consuming project
// might have elsewhere.
const marked = new Marked({
  gfm: true,
  // Load-bearing, not a style preference: every description/pin field this
  // feeds has always rendered a bare `\n` as a real line break (previously
  // via useLinkify.js's own `.replace(/\n/g, '<br>')`), so every existing
  // one ever written was typed with that assumption. Without this, a
  // multi-line description that used to read as separate lines would
  // suddenly bunch into one paragraph the moment this ships.
  breaks: true,
})

// A markdown link's target has no scheme at all (relative path, `#anchor`,
// `?query`, or a protocol-relative `//host`) or is explicitly http(s) --
// anything else (`javascript:`, `data:`, `vbscript:`, ...) is a scheme
// that can run code or spoof content from inside what looks like a plain
// link, so it's rejected here at render time rather than trusted to
// DOMPurify alone (defense in depth, not a replacement for it below).
function isSafeHref(href) {
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec((href ?? '').trim())
  return !scheme || /^https?$/i.test(scheme[1])
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Overrides marked's default link output to match useLinkify.js's own
// `linkify()` exactly (target="_blank" + rel + the same `underline` class)
// so a Markdown-authored `[text](url)` and a bare autolinked URL render
// identically to every other link already in this app -- both routes
// through this same renderer, not just explicit `[]()` syntax. Falls back
// to the link's own (already-escaped-by-the-parser) label text with no
// `<a>` wrapper at all for an unsafe scheme, rather than a dead/stripped
// link with no href.
marked.use({
  renderer: {
    link(token) {
      const label = this.parser.parseInline(token.tokens)
      if (!isSafeHref(token.href)) return label
      return `<a href="${escapeAttr(token.href)}" target="_blank" rel="noopener noreferrer" class="underline">${label}</a>`
    },
  },
})

// Explicit allowlist, no raw HTML passthrough at all -- marked already
// escapes literal `<script>`/etc. typed as plain text by default, but this
// is the real backstop and runs on every render path here, not just the
// "obvious" one. `input`/`type`/`checked`/`disabled` are for GFM task-list
// checkboxes (`- [ ] ...`/`- [x] ...`, one of `gfm: true`'s own features --
// marked renders these as a real `<input type=checkbox disabled>`, not a
// styled span, so it needs its own explicit allowance or it silently
// vanishes). `img` is deliberately absent: image embedding is out of scope
// for this pass (see the design doc's own scope note) -- a hand-typed
// `![alt](url)` still *parses*, it just renders nothing, the same as any
// other tag missing from this list, rather than half-supporting a bare
// external image URL with no upload story behind it.
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'del', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'input',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a',
]
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'type', 'checked', 'disabled']

/**
 * Parse `text` as Markdown and sanitize the result -- the one function
 * every Markdown render path in this app (MarkdownText.vue, the "Preview"
 * tab in MarkdownEditor.vue, markdownToPlainText below) goes through.
 * @param {string} text
 * @returns {string} sanitized HTML, safe to bind via v-html
 */
export function renderMarkdown(text) {
  if (!text) return ''
  const html = marked.parse(text)
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}

// Render-then-strip, not truncate-then-parse: a naive substring cut of raw
// Markdown source is far more likely to land mid-`**bold**`/`[text](url)`/
// fenced-code-block than plain text ever was, producing broken or bleeding
// formatting in a 2-line card preview. Rendering first and extracting
// `textContent` gets clean plain words with every marker stripped, safe to
// truncate afterward with ordinary substring logic (e.g. TruncatedText.vue,
// unchanged itself -- callers just stop passing raw Markdown to its
// `linkify` prop and pass this function's output instead). Collapses
// marked's own inter-block newlines (real `\n` characters between e.g.
// `</p>` and `<ul>` in its output, preserved by textContent) down to single
// spaces -- a compact-card preview only ever needs "the words", not the
// original block structure.
export function markdownToPlainText(text) {
  const html = renderMarkdown(text)
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent.replace(/\s+/g, ' ').trim()
}

/**
 * Composable wrapper, matching this repo's own useX() convention (e.g.
 * useLinkify) -- both functions are also exported standalone since
 * MarkdownText.vue/MarkdownEditor.vue and TruncatedText.vue's callers are
 * pure-function call sites, the same reasoning `linkify`/`toDateKey` are
 * each exported standalone too.
 * @returns {Object}
 */
export function useMarkdown() {
  return { renderMarkdown, markdownToPlainText }
}
