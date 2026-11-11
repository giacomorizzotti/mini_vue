import { ref, watch, nextTick } from 'vue'

// Keyboard and ARIA plumbing for a text input with a pop-up option list (the
// WAI-ARIA "combobox with listbox popup" pattern), shared by Autocomplete and
// MultiAutocomplete. Focus never leaves the input: arrow keys move a
// highlight through the list, and aria-activedescendant tells assistive
// technology which option that is.

let nextId = 0

const REMOVE_LABELS = { en: 'Remove', it: 'Rimuovi', fr: 'Retirer', de: 'Entfernen', es: 'Quitar' }

/** "Remove <label>" in the page's language (<html lang>), for chip remove buttons. */
export function removeLabel(label) {
  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase()
  return `${REMOVE_LABELS[lang] ?? REMOVE_LABELS.en} ${label}`
}

/**
 * @param {import('vue').Ref<Array>} items - the rows the list shows, in order
 * @param {import('vue').Ref<boolean>} shown - whether the list is on screen
 * @returns {{ listboxId: string, optionId: (index: number) => string,
 *   activeIndex: import('vue').Ref<number>, move: (step: number) => void }}
 */
export function useCombobox(items, shown) {
  const baseId = `mini-combobox-${++nextId}`
  const listboxId = `${baseId}-listbox`
  const optionId = index => `${baseId}-option-${index}`
  const activeIndex = ref(-1)

  // Nothing is highlighted until an arrow key is pressed, and new results or
  // a closed list clear the highlight, so Enter without arrows still picks
  // the first match, as it always did. 'sync', so a caller can open the list
  // and then move() in the same handler without the reset landing after it.
  watch([items, shown], () => { activeIndex.value = -1 }, { flush: 'sync' })

  /** Moves the highlight by `step` rows, wrapping around at both ends. */
  function move(step) {
    const total = items.value.length
    if (!total) return
    activeIndex.value = activeIndex.value < 0
      ? (step > 0 ? 0 : total - 1)
      : (activeIndex.value + step + total) % total
    nextTick(() => document.getElementById(optionId(activeIndex.value))?.scrollIntoView({ block: 'nearest' }))
  }

  return { listboxId, optionId, activeIndex, move }
}
