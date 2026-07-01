import { ref } from 'vue'

// Same-key calls share one ref — e.g. an entity rendered twice on the same
// page (a compact card and a panel copy) must reflect a toggle made on
// either instance immediately. Cache lives for the page's lifetime.
const cache = new Map()

/**
 * A ref shared across every call with the same key, for state that should
 * stay in sync between multiple mounted instances of the same entity within
 * a session — but, unlike usePersistedRef, doesn't survive a reload.
 * @param {string} key - shared across calls, should be unique per stored item
 * @param {*} defaultValue - used the first time this key is requested
 * @returns {import('vue').Ref}
 */
export function useSharedRef(key, defaultValue) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const state = ref(defaultValue)
  cache.set(key, state)
  return state
}
