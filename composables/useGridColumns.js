import { computed } from 'vue'
import { useElementWidth } from './useElementWidth'
import { resolveBoxWidth, distinctBoxSizes } from './boxWidth'
import { usePersistedRef } from './usePersistedRef'

// Every mini box-width label expressed as "how many fit in a row" -- the
// vocabulary a "N per row" control actually wants, translated here onto
// the Box `size` prop it drives underneath.
const COLUMN_TO_BOX_SIZE = { 1: '100', 2: '50', 3: '33', 4: '25', 5: '20' }
const BOX_SIZE_TO_COLUMN = { 100: 1, 50: 2, 33: 3, 25: 4, 20: 5 }

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
 * @param {Array<number>} [columnOptions] - candidates to cycle through, defaults to 1-5
 */
export function useGridColumns(elRef, storageKey, defaultColumns, columnOptions = [1, 2, 3, 4, 5]) {
  const width = useElementWidth(elRef)
  const columns = usePersistedRef(storageKey, defaultColumns)
  const boxSize = computed(() => COLUMN_TO_BOX_SIZE[columns.value])

  function hasDistinctColumns() {
    const boxSizes = columnOptions.map(c => COLUMN_TO_BOX_SIZE[c])
    return distinctBoxSizes(boxSizes, width.value).length > 1
  }

  function effectiveColumns() {
    const resolved = Math.round(resolveBoxWidth(boxSize.value, width.value))
    return BOX_SIZE_TO_COLUMN[resolved] ?? columns.value
  }

  function cycleColumns() {
    const currentResolved = resolveBoxWidth(boxSize.value, width.value)
    let index = columnOptions.indexOf(columns.value)
    for (let step = 0; step < columnOptions.length; step++) {
      index = (index + 1) % columnOptions.length
      const candidate = columnOptions[index]
      if (resolveBoxWidth(COLUMN_TO_BOX_SIZE[candidate], width.value) !== currentResolved) {
        columns.value = candidate
        return
      }
    }
  }

  return { columns, boxSize, hasDistinctColumns, effectiveColumns, cycleColumns }
}
