import { ref } from 'vue'

// Native-HTML5 drag-and-drop for reordering the items of ONE vertical list
// (no dependency; like every other native-DnD use here it does not react to
// touch input). Domain-agnostic: it only ever sees ids and calls back with
// the new id order -- what an order means, and persisting it, stay the
// caller's.
//
//   const { draggingId, overId, overPosition, itemProps } = useSortableList(ids => save(ids))
//   <li v-for="t in tasks" :key="t.id" v-bind="itemProps(t.id, ids)"
//       :class="{ dragging: draggingId === t.id, 'drop-before': overId === t.id && overPosition === 'before' }">
//
// `ids` is the list's current order; it is passed per call (not captured)
// so a re-sorted list always drops against what is on screen now.
export function useSortableList(onReorder) {
  const draggingId = ref(null)
  const overId = ref(null)
  const overPosition = ref(null)

  function reset() {
    draggingId.value = null
    overId.value = null
    overPosition.value = null
  }

  function onDragStart(id, e) {
    draggingId.value = id
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(id))
  }

  function onDragOver(id, e) {
    if (draggingId.value === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    overId.value = id
    overPosition.value = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  }

  function onDrop(ids, e) {
    e.preventDefault()
    const from = draggingId.value
    const target = overId.value
    const position = overPosition.value
    reset()
    if (from === null || target === null || from === target) return
    const next = ids.filter(id => id !== from)
    const at = next.indexOf(target) + (position === 'after' ? 1 : 0)
    next.splice(at, 0, from)
    if (next.some((id, i) => id !== ids[i])) onReorder(next)
  }

  function itemProps(id, ids) {
    return {
      draggable: true,
      onDragstart: e => onDragStart(id, e),
      onDragover: e => onDragOver(id, e),
      onDrop: e => onDrop(ids, e),
      onDragend: reset,
    }
  }

  return { draggingId, overId, overPosition, itemProps }
}
