import { computed, toValue } from 'vue'
import { useElementWidth } from './useElementWidth'
import { resolveBoxWidth, distinctBoxSizes, rawBoxStyle } from './boxWidth'
import { usePersistedRef } from './usePersistedRef'

// Every mini box-width label expressed as "how many fit in a row" -- the
// vocabulary a "N per row" control actually wants, translated here onto
// the Box `size` prop it drives underneath. "16" (16.666%, exact sixths)
// is already a real, CSS-backed box-width label (_box.scss's $box-widths
// map) -- added here so a caller with unusually compact row content (a
// minified TaskBox, say) has somewhere to go past 5-per-row without
// needing a new Sass width invented for it.
const COLUMN_TO_BOX_SIZE = { 1: '100', 2: '50', 3: '33', 4: '25', 5: '20', 6: '16' }
const BOX_SIZE_TO_COLUMN = { 100: 1, 50: 2, 33: 3, 25: 4, 20: 5, 16: 6 }

/**
 * The column count a mini box-width label (25, 33, 50, ...) corresponds
 * to -- the inverse of what useGridColumns uses internally. Handy for a
 * caller migrating an existing hardcoded `size` prop value into an
 * initial `defaultColumns` for useGridColumns.
 * @param {number|string} boxSize
 * @param {number} [fallback] - returned for an unrecognized label (default 3)
 */
export function columnsForBoxSize(boxSize, fallback = 3) {
  return BOX_SIZE_TO_COLUMN[Number(boxSize)] ?? fallback
}

/**
 * A persisted "N per row" grid-size control for a mini Boxes/Box grid,
 * that automatically skips/hides itself against whatever its own live
 * container width can actually distinguish -- e.g. "3 per row" and
 * "2 per row" can render at the exact same width inside a narrow
 * container (see boxWidth.js), so cycling skips straight past a choice
 * that wouldn't change anything, and hasDistinctColumns() tells the
 * caller when *no* choice would (every candidate has collapsed to one
 * width), so the control can hide itself entirely rather than sit there
 * doing nothing.
 *
 * Pair with `contain` on the Boxes element being sized, and pass its
 * template ref as `elRef` (same ref, bound the normal top-level way --
 * `<Boxes ref="myGridEl" contain>`).
 *
 * Two calls with the *same* storageKey share one live `columns` value
 * (usePersistedRef's own same-key-sharing) while each still tracks its
 * own element's width independently -- the shape a grid that's rendered
 * more than once for the same underlying data wants (e.g. a compact-card
 * copy and a detail-panel copy of the same entity's grid).
 *
 * @param {import('vue').Ref<HTMLElement|import('vue').ComponentPublicInstance|null>} elRef
 * @param {string} storageKey - usePersistedRef key; caller decides the scope
 * @param {number} defaultColumns - default column count for a never-customized storageKey
 * @param {Array<number>|import('vue').MaybeRefOrGetter<Array<number>>} [columnOptions] -
 *   candidates to cycle through, defaults to 1-6. A plain array works exactly as before;
 *   a ref/computed/getter is also accepted (read via toValue() on every call, not just
 *   once at setup) for a caller whose valid range depends on something else reactive --
 *   e.g. a "minified" toggle that makes each row's content compact enough to allow more
 *   per row than the caller's own full-size cards do.
 * @param {Object} [opts]
 * @param {number|null|import('vue').MaybeRefOrGetter<number|null>} [opts.minColumnPx] -
 *   opt-in, default null (every existing caller is unaffected). mini's own box-*
 *   classes only ever offer 5 hand-tuned width tiers (see boxWidth.js) -- fine
 *   for normal card content, but a genuinely narrow container (a Dashboard
 *   panel capped well below the 992px "lg" tier, a phone-width viewport) often
 *   has *literally* enough room for one more column than those 5 tiers can
 *   tell apart, and a caller whose row content is unusually compact (a
 *   minified single-line TaskBox row, say) doesn't need anywhere near a full
 *   tier's worth of extra width to still look right packed tighter. Once set,
 *   any columnOptions candidate that mini's own tiers can't yet distinguish
 *   from a lower one is still offered as soon as `width / candidate >=
 *   minColumnPx` -- a plain "would it literally fit" check, independent of
 *   mini's breakpoint table -- and rendered via a literal, non-tiered
 *   percentage (boxWidth.js's rawBoxStyle(), see usesRawStyle()/rawStyle()
 *   below) instead of a box-* class, since the box-* class it'd otherwise get
 *   is exactly the one whose *duplicate* width this bypass exists to get past.
 */
export function useGridColumns(elRef, storageKey, defaultColumns, columnOptions = [1, 2, 3, 4, 5, 6], opts = {}) {
  const { minColumnPx = null } = opts
  const width = useElementWidth(elRef)
  const columns = usePersistedRef(storageKey, defaultColumns)
  // Clamped to whatever the *current* columnOptions actually allow -- a
  // persisted value from before columnOptions narrowed (e.g. minified
  // toggled back off, dropping 6 back out of range) must not keep
  // rendering at a width nothing currently offers cycling back to.
  const boxSize = computed(() => {
    const options = toValue(columnOptions)
    const clamped = options.includes(columns.value) ? columns.value : Math.max(...options)
    return COLUMN_TO_BOX_SIZE[clamped]
  })

  // The subset of columnOptions that mini's own tiered box-* classes
  // currently render as genuinely different widths, in order -- e.g. at a
  // container width where "4 per row" and "5 per row" both collapse onto
  // the same actual 2-column layout as "2 per row" already does, this
  // keeps only the first of the three.
  function tierDistinctColumnOptions() {
    const options = toValue(columnOptions)
    const boxSizes = options.map(c => COLUMN_TO_BOX_SIZE[c])
    return distinctBoxSizes(boxSizes, width.value).map(label => BOX_SIZE_TO_COLUMN[label])
  }

  // distinctColumnOptions() is what cycleColumns() below actually cycles
  // through (not the raw columnOptions) specifically so it can never
  // advance to a nominally different value whose resolved width duplicates
  // one already seen earlier in the same lap -- an earlier version only
  // compared a candidate against whatever was *immediately* current, which
  // let it "advance" from column-3 to column-4 whenever 4 happened to
  // differ from 3, even though 4 might resolve to the exact same width
  // column-2 already used -- effectiveColumns() (truthfully reporting
  // what's actually rendered) would then show that value's *true* column
  // count, which could be lower than one already passed through, reading
  // as the cycle going backwards or repeating (e.g. 1 -> 2 -> 3 -> 2 -> 3
  // -> ... at a width where nominal 4/6 collapse onto 2/3's own widths).
  //
  // With minColumnPx set, this is tierDistinctColumnOptions() *widened* --
  // a candidate mini's own tiers can't yet tell apart still qualifies once
  // it would literally fit (see minColumnPx's own docs above). Every such
  // candidate is, by construction, its own distinct width (100/c is unique
  // per c), so no further dedup is needed for that part of the list.
  function distinctColumnOptions() {
    const tiered = tierDistinctColumnOptions()
    const minPx = toValue(minColumnPx)
    if (minPx == null) return tiered
    const options = toValue(columnOptions)
    const tieredSet = new Set(tiered)
    return options.filter(c => tieredSet.has(c) || width.value / c >= minPx)
  }

  function hasDistinctColumns() {
    return distinctColumnOptions().length > 1
  }

  // Whether the *currently selected* columns.value is one of the
  // minColumnPx-only candidates above -- i.e. mini's own box-* class for it
  // would actually render at a duplicate (wrong) width right now, so the
  // template must render it via rawStyle() instead of :size="boxSize".
  function usesRawStyle() {
    if (toValue(minColumnPx) == null) return false
    return !tierDistinctColumnOptions().includes(columns.value)
  }

  // The literal, non-tiered style for the currently selected columns.value
  // -- pass as :style alongside a Box with no (or an unrelated) :size, see
  // usesRawStyle()'s own docs.
  function rawStyle() {
    return rawBoxStyle(100 / columns.value)
  }

  function effectiveColumns() {
    // A minColumnPx-driven raw style always renders exactly the column
    // count that was asked for -- unlike a box-* class, it never collapses
    // onto some other tier's width, so there's nothing to resolve.
    if (usesRawStyle()) return columns.value
    // Math.floor, not Math.round -- every mini box-width label is itself
    // the truncated integer of its true fraction (100/3 -> "33", 100/6 ->
    // "16", never rounded: 16.666666 would round to 17, which isn't a key
    // BOX_SIZE_TO_COLUMN has). Whole-number resolved widths (25, 20, 50,
    // 100) floor to themselves either way, so this only changes behavior
    // for the repeating-decimal ones.
    const resolved = Math.floor(resolveBoxWidth(boxSize.value, width.value))
    return BOX_SIZE_TO_COLUMN[resolved] ?? columns.value
  }

  function cycleColumns() {
    const options = distinctColumnOptions()
    if (!options.length) return
    const index = options.indexOf(columns.value)
    columns.value = options[(index + 1) % options.length]
  }

  return { columns, boxSize, hasDistinctColumns, effectiveColumns, cycleColumns, usesRawStyle, rawStyle }
}
