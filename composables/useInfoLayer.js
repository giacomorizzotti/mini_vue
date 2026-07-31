import { usePersistedRef } from './usePersistedRef'

// Shared, localStorage-persisted on/off switch for InfoTip.vue — every
// instance across every page reads the same ref, so one checkbox (e.g. on a
// Settings page) turns the whole "info layer" on/off app-wide at once.
export function useInfoLayer() {
  return usePersistedRef('mini.infoLayerEnabled', true)
}
