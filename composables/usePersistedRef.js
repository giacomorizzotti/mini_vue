import { ref, watch } from 'vue'

// Same-key calls share one ref — e.g. an entity rendered twice on the same
// page (a compact card and a panel copy) must reflect a toggle made on
// either instance immediately, not just after the next reload.
const cache = new Map()

/**
 * A ref that's automatically persisted to localStorage under the given key —
 * reads its initial value from storage (falling back to defaultValue), and
 * writes back on every change. Useful for remembering UI preferences (an
 * expanded/collapsed panel, a chosen sort order, etc.) across page loads.
 * Calling this again with the same key returns the same live ref.
 * @param {string} key - localStorage key, should be unique per stored item
 * @param {*} defaultValue - used when nothing is stored yet
 * @returns {import('vue').Ref}
 */
export function usePersistedRef(key, defaultValue) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  let initial = defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      initial = JSON.parse(stored)
    }
  } catch {
    initial = defaultValue
  }

  const state = ref(initial)

  watch(state, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full/unavailable — preference just won't persist
    }
  })

  cache.set(key, state)
  return state
}
