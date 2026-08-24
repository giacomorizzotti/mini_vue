<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '../composables/useMarkdown'

// Renders Markdown source (from MarkdownEditor.vue) as sanitized HTML.
// The Markdown equivalent of RichText.vue -- untruncated, full/panel
// views. See TruncatedText.vue's callers for the compact-card equivalent
// (markdownToPlainText, not this component -- a truncated preview strips
// to plain text rather than truncating rendered Markdown, see
// useMarkdown.js's own docstring for why).
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
})

const html = computed(() => renderMarkdown(props.text))
</script>

<template>
  <div v-html="html" class="markdown-text"></div>
</template>
