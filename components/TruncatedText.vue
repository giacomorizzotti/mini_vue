<script setup>
import { ref, computed } from 'vue'
import Button from '@/mini/components/Button.vue'
import Space from '@/mini/components/Space.vue'
import { linkify } from '../composables/useLinkify'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  limit: {
    type: Number,
    default: 256,
  },
  // Opt-in, default false -- existing callers across every project this
  // shared component reaches keep their exact current plain-text
  // rendering unless they ask for this. When true, the truncated text is
  // rendered through the same linkify() RichText.vue uses (escaped, URLs
  // auto-linked, newlines preserved as <br>), via v-html instead of plain
  // interpolation -- truncation always happens on the raw text first
  // (below), never on the HTML linkify() produces, so a cut never lands
  // mid-tag.
  linkify: {
    type: Boolean,
    default: false,
  },
})

const expanded = ref(false)

const isTruncated = computed(() => props.text.length > props.limit)

const displayText = computed(() => {
  if (expanded.value || !isTruncated.value) return props.text
  return props.text.slice(0, props.limit).trimEnd() + '…'
})

const displayHtml = computed(() => linkify(displayText.value))
</script>

<template>
  <span v-if="linkify" v-html="displayHtml"></span>
  <template v-else>{{ displayText }}</template>
  <a
    v-if="isTruncated"
    class="light-grey-text dark-grey-text-hover XS m-0 underline"
    style="padding: 0 calc(var(--padding)*0.25)"
    @click="expanded = !expanded"
  >{{ expanded ? 'Show less' : 'Show more' }}</a>
</template>
