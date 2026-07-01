import { ref } from 'vue'

/**
 * Generic DRF-style paginated list loader: follows `next` links from a list
 * endpoint via the given authenticated fetch function, exposing reactive
 * items/loading/error state plus a refresh() for reloading on demand.
 * @param {string} url - the list endpoint to fetch
 * @param {Function} authFetch - fetch-like function, e.g. an auth store's authFetch
 * @param {{immediate?: boolean}} [options] - set immediate: false to skip the initial fetch
 */
export function useApiList(url, authFetch, { immediate = true } = {}) {
  const items = ref([])
  const loading = ref(immediate)
  const hasError = ref(false)

  async function refresh() {
    loading.value = true
    hasError.value = false
    try {
      const results = []
      let next = url
      while (next) {
        const response = await authFetch(next)
        if (!response.ok) {
          throw new Error('Request failed')
        }
        const payload = await response.json()
        results.push(...payload.results)
        next = payload.next
      }
      items.value = results
    } catch {
      hasError.value = true
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    refresh()
  }

  return { items, loading, hasError, refresh }
}
