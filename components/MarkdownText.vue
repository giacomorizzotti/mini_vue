<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '../composables/useMarkdown'
import { linkify } from '../composables/useLinkify'

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
  // Mirrors MarkdownEditor.vue's own `markdown` prop, default included --
  // the two are meant to be fed the same stored per-instance value (e.g. a
  // model's `description_is_markdown`). false falls back to RichText.vue's
  // own rendering (linkify: escaped, URLs auto-linked, newlines as <br>,
  // nothing else) instead of parsing as Markdown, so a field someone
  // deliberately wrote as plain text never gets a stray `#`/`*`/`-`
  // reinterpreted as formatting here.
  markdown: {
    type: Boolean,
    default: false,
  },
})

const html = computed(() => props.markdown ? renderMarkdown(props.text) : linkify(props.text))
</script>

<template>
  <div v-html="html" class="markdown-text"></div>
</template>
