<script setup>

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMessage } from '@/mini/composables/useMessage'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import { OWNER } from '@/config/owner'

// Default matches every consumer's current behavior unchanged -- only a
// project that actually processes data for a purpose beyond login/analytics
// (e.g. jpm's Paddle billing) needs to pass a wider list; see the shared
// api.uwa.agency/privacy-policy/ service's own $PURPOSE_CATALOG for which
// keys exist.
const props = defineProps({
  purposes: { type: String, default: 'login,analytics' },
  // Optional explicit override. Omitted (the common case, since this is a
  // routed page rather than a directly-embedded component like GDPR.vue --
  // a route's static `props` config can't bind a reactive value), it
  // auto-detects from <html lang="...">, the same convention GDPR.vue
  // itself uses -- and the exact thing jpm's useLocale.js:setLocale()
  // already keeps in sync on every language switch specifically so mini
  // components like this one stay correct. The shared API only has
  // it/en content, so anything other than Italian resolves to English
  // rather than the API's own bare 'not literally en -> it' default --
  // a French/German visitor should see English, not a language they may
  // not read at all.
  lang: { type: String, default: null },
})

const { showMessage } = useMessage()
const privacyHtml = ref('')

function resolveApiLang() {
  const detected = props.lang ?? document.documentElement.lang?.split('-')[0] ?? 'it'
  return detected === 'it' ? 'it' : 'en'
}

async function load() {
  try {
    const url = new URL('https://api.uwa.agency/privacy-policy/')
    Object.entries(OWNER).forEach(([k, v]) => url.searchParams.set(k, v))
    url.searchParams.set('purposes', props.purposes)
    url.searchParams.set('hosting_region', 'eu')
    url.searchParams.set('lang', resolveApiLang())
    const response = await fetch(url)
    privacyHtml.value = await response.text()
  } catch (error) {
    showMessage('Errore nel caricamento della privacy policy.', 'danger')
  }
}

// <html lang> can change in place (no route change/remount) when a
// consumer's own language switcher runs -- watch it so an in-page switch
// updates the shown policy language too, not just a hard reload.
let observer
onMounted(() => {
  load()
  observer = new MutationObserver(load)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => props.lang, load)

</script>

<template>
  <Container fw>
    <Container>
      <Boxes spaceTopBot>
        <Box :size="100">
          <h1>{{ resolveApiLang() === 'it' ? 'Informativa privacy' : 'Privacy policy' }}</h1>
        </Box>
        <Box :size="66" v-html="privacyHtml" padding="0">
        </Box>
      </Boxes>
    </Container>
  </Container>
</template>

<style lang="scss" scoped>
</style>
