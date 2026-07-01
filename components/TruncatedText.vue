<script setup>
import { ref, computed } from 'vue'
import Button from '@/mini/components/Button.vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  limit: {
    type: Number,
    default: 150,
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
  <Button
    v-if="isTruncated"
    type="button"
    size="XS"
    color="light-grey"
    invert
    rounded
    class="transp-bg ms-05"
    style="padding: 0 calc(var(--padding)*0.5)"
    @click="expanded = !expanded"
  >{{ expanded ? 'Show less' : 'Show more' }}</Button>
</template>
