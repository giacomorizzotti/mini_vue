// Mirrors mini's own css/scss/_box.scss $box-widths/$breakpoints tables --
// keep these two in sync if either changes. There's no way to read Sass
// variables from JS at runtime, so this is a deliberate, documented
// duplication rather than something derived automatically.
const BOX_WIDTH_BREAKPOINTS = [0, 576, 768, 992, 1400] // px: zero, sm, md, lg, xl

const BOX_WIDTHS = {
  8: [100, 50, 33.333333, 16.666666, 8.333333],
  10: [100, 50, 20, 20, 10],
  12: [100, 50, 25, 25, 12.5],
  15: [100, 50, 25, 20, 15],
  16: [100, 50, 33.333333, 16.666666, 16.666666],
  20: [100, 50, 50, 20, 20],
  25: [100, 50, 50, 25, 25],
  30: [100, 50, 50, 30, 30],
  33: [100, 50, 33.333333, 33.333333, 33.333333],
  40: [100, 50, 40, 40, 40],
  50: [100, 50, 50, 50, 50],
  60: [100, 50, 60, 60, 60],
  66: [100, 50, 66.666666, 66.666666, 66.666666],
  70: [100, 100, 50, 70, 70],
  75: [100, 100, 50, 75, 75],
  80: [100, 100, 50, 80, 80],
  88: [100, 100, 75, 75, 87.5],
  90: [100, 100, 80, 80, 90],
  100: [100, 100, 100, 100, 100],
}

/**
 * The actual rendered width percentage a mini `.box-{label}` (or a Box's
 * `size` prop) currently resolves to, given the live width of its
 * .contain ancestor -- the JS-side answer to the same question
 * _box.scss's @container rules answer in CSS. Without a .contain
 * ancestor this isn't meaningful (the element sizes off the *viewport*
 * instead) -- pass the window width in that case if you need the
 * equivalent answer.
 *
 * @param {number|string} label - one of mini's box-width keys (25, 33, 50, 100, ...)
 * @param {number} containerWidth - px
 * @returns {number|null} resolved width as a percentage (0-100), or null for an unknown label
 */
export function resolveBoxWidth(label, containerWidth) {
  const widths = BOX_WIDTHS[label]
  if (!widths) return null
  let tier = 0
  for (let i = 0; i < BOX_WIDTH_BREAKPOINTS.length; i++) {
    if (containerWidth >= BOX_WIDTH_BREAKPOINTS[i]) tier = i
  }
  return widths[tier]
}

/**
 * Filters `labels` down to only those that currently resolve to a
 * visually distinct width at `containerWidth` -- keeps the first label
 * for each resolved value, in input order. Use to keep a size picker
 * (buttons, cycle control, ...) from offering choices that would look
 * identical right now, e.g. inside a narrow .contain'd panel where
 * several % options have already collapsed to the same width.
 *
 * @param {Array<number|string>} labels
 * @param {number} containerWidth
 * @returns {Array<number|string>}
 */
export function distinctBoxSizes(labels, containerWidth) {
  const seen = new Set()
  const result = []
  for (const label of labels) {
    const resolved = resolveBoxWidth(label, containerWidth)
    if (resolved === null || seen.has(resolved)) continue
    seen.add(resolved)
    result.push(label)
  }
  return result
}
