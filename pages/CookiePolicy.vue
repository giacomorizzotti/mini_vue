<script setup>

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMessage } from '@/mini/composables/useMessage'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import { OWNER } from '@/config/owner'

// Default (no services named) matches every consumer's current behavior
// unchanged -- only a project that actually embeds a named third-party
// service beyond the page's own generic cookie categories (e.g. jpm's
// Google Analytics/Paddle) needs to pass one. See the shared
// api.uwa.agency/cookie-policy/ service's own $SERVICE_CATALOG for which
// keys exist.
const props = defineProps({
  services: { type: String, default: '' },
  // See PrivacyPolicy.vue's own matching prop for the full reasoning --
  // same auto-detect-from-<html lang> convention, same it/en-only fallback
  // (fr/de resolve to English, never the API's own bare "not literally
  // en -> it" default).
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
    const url = new URL('https://api.uwa.agency/cookie-policy/')
    Object.entries(OWNER).forEach(([k, v]) => url.searchParams.set(k, v))
    if (props.services) url.searchParams.set('services', props.services)
    url.searchParams.set('lang', resolveApiLang())
    const response = await fetch(url)
    privacyHtml.value = await response.text()
  } catch (error) {
    showMessage('Errore nel caricamento della cookie policy.', 'danger')
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
          <h1>Cookie policy</h1>
        </Box>
        <Box :size="66" v-html="privacyHtml" padding="0">
        </Box>
      </Boxes>
    </Container>
  </Container>
</template>

<style lang="scss" scoped>
</style>
