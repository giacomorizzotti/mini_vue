<script setup>
import { ref, computed } from 'vue'
import Button from '@/mini/components/Button.vue'
import Space from '@/mini/components/Space.vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  limit: {
    type: Number,
    default: 256,
  },
})

const expanded = ref(false)

const isTruncated = computed(() => props.text.length > props.limit)

const displayText = computed(() => {
  if (expanded.value || !isTruncated.value) return props.text
  return props.text.slice(0, props.limit).trimEnd() + '…'
})
</script>

<template>
  {{ displayText }}
  <a
    v-if="isTruncated"
    class="light-grey-text dark-grey-text-hover XS m-0 underline"
    style="padding: 0 calc(var(--padding)*0.25)"
    @click="expanded = !expanded"
  >{{ expanded ? 'Show less' : 'Show more' }}</a>
</template>
