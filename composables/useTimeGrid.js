import { ref, computed } from 'vue'

function snapToSlot(minutes, slotMinutes, rangeStart, rangeEnd) {
  const snapped = Math.round(minutes / slotMinutes) * slotMinutes
  return Math.min(Math.max(snapped, rangeStart), rangeEnd)
}

// Shared by every drag composable below: converts a pointer event's
// vertical position within `getContainer()`'s element into a snapped
// minutes-since-midnight value. Takes a getter rather than a ref directly
// so the track element can live in a different component than the one
// driving the drag (a plain ref would get auto-unwrapped if passed down
// as a prop, losing its live binding — a getter function survives that).
function makeMinutesAtPointer(getContainer, rangeStart, rangeEnd, slotMinutes) {
  return function minutesAtPointer(event) {
    const el = getContainer()
    if (!el) return rangeStart
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1)
    return snapToSlot(rangeStart + ratio * (rangeEnd - rangeStart), slotMinutes, rangeStart, rangeEnd)
  }
}

/**
 * Geometry for a vertical hour track spanning [startHour, endHour) — pure
 * config + computed values, no DOM access. Pairs with `useDragToCreate`/
 * `useDragToMove`/`useDragToResize` for the interactive parts, or can be
 * used alone just to render hour labels/positioning for a day/week grid.
 * @param {{startHour?: number, endHour?: number, slotMinutes?: number}} [options]
 * @returns {{
 *   totalMinutes: number,
 *   hourMarks: import('vue').ComputedRef<{minutes: number, label: string}[]>,
 *   minutesToPercent: (minutes: number) => number,
 *   durationToPercent: (durationMinutes: number) => number,
 *   snapMinutes: (minutes: number) => number,
 *   minutesToTimeLabel: (minutes: number) => string,
 * }}
 */
export function useTimeGrid({ startHour = 0, endHour = 24, slotMinutes = 15 } = {}) {
  const rangeStart = startHour * 60
  const rangeEnd = endHour * 60
  const totalMinutes = rangeEnd - rangeStart

  function minutesToTimeLabel(minutes) {
    // Clamp below 24:00 — a range's upper bound (e.g. `endHour * 60` =
    // 1440) is a valid *position* (100%) but "24:00" isn't a valid wall-
    // clock label or datetime-local string, so it reads as 23:59 instead.
    const clamped = Math.min(Math.max(minutes, 0), 24 * 60 - 1)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`
  }

  const hourMarks = computed(() => {
    const marks = []
    for (let h = startHour; h < endHour; h++) {
      marks.push({ minutes: h * 60, label: minutesToTimeLabel(h * 60) })
    }
    return marks
  })

  function minutesToPercent(minutes) {
    return ((minutes - rangeStart) / totalMinutes) * 100
  }

  function durationToPercent(durationMinutes) {
    return (durationMinutes / totalMinutes) * 100
  }

  function snapMinutes(minutes) {
    return snapToSlot(minutes, slotMinutes, rangeStart, rangeEnd)
  }

  return { totalMinutes, hourMarks, minutesToPercent, durationToPercent, snapMinutes, minutesToTimeLabel }
}

/**
 * Pointer-driven drag-to-create over one vertical hour track element (e.g.
 * a single day's column in a week grid). A plain click (negligible
 * movement) creates a default-length block at that time instead of a
 * zero-length one, mirroring how calendar apps treat a click vs. a drag.
 * Uses Pointer Events (not mouse events) so the same listener set handles
 * mouse, touch, and pen.
 * @param {() => HTMLElement|null} getContainer - returns the track
 *   element; its height represents [startHour, endHour) top-to-bottom.
 * @param {{
 *   startHour?: number, endHour?: number, slotMinutes?: number,
 *   clickDurationMinutes?: number,
 *   onCreate?: (range: {startMinutes: number, endMinutes: number}) => void,
 * }} [options]
 * @returns {{
 *   previewRange: import('vue').Ref<{startMinutes: number, endMinutes: number}|null>,
 *   onPointerDown: (event: PointerEvent) => void,
 * }}
 */
export function useDragToCreate(getContainer, {
  startHour = 0, endHour = 24, slotMinutes = 15, clickDurationMinutes = 60, onCreate,
} = {}) {
  const rangeStart = startHour * 60
  const rangeEnd = endHour * 60
  const minutesAtPointer = makeMinutesAtPointer(getContainer, rangeStart, rangeEnd, slotMinutes)

  const previewRange = ref(null)
  let anchorMinutes = null

  function onPointerMove(event) {
    const current = minutesAtPointer(event)
    previewRange.value = {
      startMinutes: Math.min(anchorMinutes, current),
      endMinutes: Math.max(anchorMinutes, current),
    }
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)

    let { startMinutes, endMinutes } = previewRange.value
    if (endMinutes - startMinutes < slotMinutes) {
      endMinutes = startMinutes + clickDurationMinutes
      if (endMinutes > rangeEnd) {
        endMinutes = rangeEnd
        startMinutes = Math.max(rangeStart, endMinutes - clickDurationMinutes)
      }
    }

    previewRange.value = null
    anchorMinutes = null
    onCreate?.({ startMinutes, endMinutes })
  }

  function onPointerDown(event) {
    if (event.target.closest?.('[data-grid-entry]')) return
    event.preventDefault()
    anchorMinutes = minutesAtPointer(event)
    previewRange.value = { startMinutes: anchorMinutes, endMinutes: anchorMinutes }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return { previewRange, onPointerDown }
}

/**
 * Pointer-driven drag-to-move for an existing block on a vertical hour
 * track — drag anywhere on the block to shift its time-of-day while
 * preserving its duration; clamped to the track's own [startHour, endHour)
 * range (no cross-day dragging). A negligible-movement press fires
 * `onClick` instead of `onMove`, so a single pointerdown listener can
 * cover both "view this" and "drag this" without racing a separate native
 * `click` listener.
 * @param {() => HTMLElement|null} getContainer - returns the track
 *   element; its height represents [startHour, endHour) top-to-bottom.
 * @param {{
 *   startHour?: number, endHour?: number, slotMinutes?: number,
 *   getRange: () => {startMinutes: number, endMinutes: number},
 *   onMove?: (range: {startMinutes: number, endMinutes: number}) => void,
 *   onClick?: () => void,
 * }} options
 * @returns {{
 *   previewRange: import('vue').Ref<{startMinutes: number, endMinutes: number}|null>,
 *   onPointerDown: (event: PointerEvent) => void,
 * }}
 */
export function useDragToMove(getContainer, {
  startHour = 0, endHour = 24, slotMinutes = 15, getRange, onMove, onClick,
} = {}) {
  const rangeStart = startHour * 60
  const rangeEnd = endHour * 60
  const minutesAtPointer = makeMinutesAtPointer(getContainer, rangeStart, rangeEnd, slotMinutes)

  const previewRange = ref(null)
  let grabOffsetMinutes = 0
  let duration = 0
  let moved = false

  function onPointerMove(event) {
    const startMinutes = Math.min(
      Math.max(minutesAtPointer(event) - grabOffsetMinutes, rangeStart),
      rangeEnd - duration,
    )
    if (startMinutes !== previewRange.value.startMinutes) moved = true
    previewRange.value = { startMinutes, endMinutes: startMinutes + duration }
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)

    const range = previewRange.value
    previewRange.value = null

    if (moved) onMove?.(range)
    else onClick?.()
  }

  function onPointerDown(event) {
    event.preventDefault()
    const { startMinutes, endMinutes } = getRange()
    duration = endMinutes - startMinutes
    grabOffsetMinutes = minutesAtPointer(event) - startMinutes
    moved = false
    previewRange.value = { startMinutes, endMinutes }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return { previewRange, onPointerDown }
}

/**
 * Pointer-driven drag-to-resize for an existing block's end time — drag a
 * handle at the block's bottom edge to change its duration while keeping
 * the start fixed; clamped to the track's own range and to a minimum
 * duration of one slot. Skips `onResize` if the drag didn't actually
 * change anything (avoids firing a no-op save for a stray click on the
 * handle).
 * @param {() => HTMLElement|null} getContainer - returns the track
 *   element; its height represents [startHour, endHour) top-to-bottom.
 * @param {{
 *   startHour?: number, endHour?: number, slotMinutes?: number,
 *   getRange: () => {startMinutes: number, endMinutes: number},
 *   onResize?: (range: {startMinutes: number, endMinutes: number}) => void,
 * }} options
 * @returns {{
 *   previewRange: import('vue').Ref<{startMinutes: number, endMinutes: number}|null>,
 *   onPointerDown: (event: PointerEvent) => void,
 * }}
 */
export function useDragToResize(getContainer, {
  startHour = 0, endHour = 24, slotMinutes = 15, getRange, onResize,
} = {}) {
  const rangeEnd = endHour * 60
  const minutesAtPointer = makeMinutesAtPointer(getContainer, startHour * 60, rangeEnd, slotMinutes)

  const previewRange = ref(null)
  let fixedStart = 0
  let initialEnd = 0

  function onPointerMove(event) {
    const endMinutes = Math.min(Math.max(minutesAtPointer(event), fixedStart + slotMinutes), rangeEnd)
    previewRange.value = { startMinutes: fixedStart, endMinutes }
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)

    const range = previewRange.value
    previewRange.value = null
    if (range.endMinutes !== initialEnd) onResize?.(range)
  }

  function onPointerDown(event) {
    event.preventDefault()
    const { startMinutes, endMinutes } = getRange()
    fixedStart = startMinutes
    initialEnd = endMinutes
    previewRange.value = { startMinutes, endMinutes }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return { previewRange, onPointerDown }
}

/**
 * Pure function: assigns each item a side-by-side `column`/`columnCount`
 * so simultaneous/overlapping items can render next to each other instead
 * of stacked on top of one another. Standard interval-packing: items are
 * grouped into clusters of transitively-overlapping items, then within
 * each cluster assigned the lowest column index not already occupied by a
 * still-open item (the same approach calendar UIs typically use).
 * @template T
 * @param {T[]} items
 * @param {(item: T) => number} getStartMinutes
 * @param {(item: T) => number} getEndMinutes
 * @returns {{item: T, column: number, columnCount: number}[]}
 */
export function layoutOverlapping(items, getStartMinutes, getEndMinutes) {
  const sorted = [...items].sort((a, b) => getStartMinutes(a) - getStartMinutes(b))
  const result = []
  let cluster = []
  let clusterEnd = -Infinity

  function flushCluster() {
    if (!cluster.length) return
    const columnEnds = []
    for (const entry of cluster) {
      let column = columnEnds.findIndex((endMinutes) => endMinutes <= entry.start)
      if (column === -1) column = columnEnds.length
      columnEnds[column] = entry.end
      entry.column = column
    }
    const columnCount = columnEnds.length
    for (const entry of cluster) result.push({ item: entry.item, column: entry.column, columnCount })
    cluster = []
  }

  for (const item of sorted) {
    const start = getStartMinutes(item)
    const end = getEndMinutes(item)
    if (cluster.length && start >= clusterEnd) {
      flushCluster()
      clusterEnd = -Infinity
    }
    cluster.push({ item, start, end })
    clusterEnd = Math.max(clusterEnd, end)
  }
  flushCluster()

  return result
}
