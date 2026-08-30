<script setup>
import { ref, onMounted } from 'vue'

// Was a fully static, hardcoded credit line -- now fetched from the shared
// api.uwa.agency/credits/ service (same repo/deploy as the privacy/cookie
// policy endpoints, see PrivacyPolicy.vue/CookiePolicy.vue's own fetch
// pattern) so wording/branding changes there without touching every
// consuming project. Props default to exactly this component's own
// previous output (UWA, using mini) so no existing consumer's rendering
// changes just from picking up this version.
//
// Unlike Privacy/Cookie policy, a failed fetch here fails silently (no
// error toast) -- this renders on literally every page as decorative
// footer chrome, not primary content; an occasional missing credit line
// isn't worth interrupting the page with a toast over.
const props = defineProps({
  by: { type: String, default: 'uwa' },      // 'uwa' | 'gr' | 'hella'
  withMini: { type: Boolean, default: true },
  // A literal CSS color value (not an enum), inserted directly into the
  // API's own inline style="color:...". Defaults to this project's own
  // --main-color custom property so the heart follows whatever theme
  // color the consuming page already defines, rather than the API's
  // hardcoded pink fallback (still used server-side when this is blank).
  color: { type: String, default: 'var(--main-color)' },
})

const creditsHtml = ref('')

onMounted(async () => {
  try {
    const url = new URL('https://api.uwa.agency/credits/')
    url.searchParams.set('by', props.by)
    if (props.withMini) url.searchParams.set('with', 'mini')
    if (props.color) url.searchParams.set('color', props.color)
    const response = await fetch(url)
    creditsHtml.value = await response.text()
  } catch (error) {
    // Silent -- see the docstring above.
  }
})
</script>

<template>
  <div v-html="creditsHtml"></div>
</template>

<style lang="scss" scoped>
</style>
