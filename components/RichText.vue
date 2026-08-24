<script setup>
import { computed } from 'vue'
import { linkify } from '../composables/useLinkify'

// Renders plain text (a description/pin-body field -- a plain <textarea>,
// not a rich editor) with http(s):// URLs auto-linked and newlines
// preserved as line breaks. No truncation -- see TruncatedText.vue's own
// opt-in `linkify` prop for the show-more/less case; both share the same
// underlying linkify() so a truncated preview and this full view render
// links identically.
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
})

const html = computed(() => linkify(props.text))
</script>

<template>
  <span v-html="html"></span>
</template>
