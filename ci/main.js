// Both barrels, as projects import them. The build fails if any export is
// missing, any component doesn't compile, or anything they reach needs a
// package or project file a consumer might not have (vue-i18n,
// @/config/...), which is why the locale code lives outside the barrels.
import * as components from '@/mini/components'
import * as composables from '@/mini/composables'

export const counts = {
  components: Object.keys(components).length,
  composables: Object.keys(composables).length,
}
