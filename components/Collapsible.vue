<script setup>
import { ref } from 'vue'
import Button from '@/mini/components/Button.vue'

const props = defineProps({
  defaultOpen: {
    type: Boolean,
    default: false,
  },
  openLabel: {
    type: String,
    default: 'Show',
  },
  closeLabel: {
    type: String,
    default: 'Hide',
  },
  buttonSize: {
    type: String,
    default: '',
  },
  buttonColor: {
    type: String,
    default: '',
  },
  buttonInvert: {
    type: Boolean,
    default: false,
  },
  buttonClass: {
    type: String,
    default: '',
  },
  contentClass: {
    type: String,
    default: '',
  },
})

const isOpen = ref(props.defaultOpen)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="collapsible">
    <div v-show="isOpen" class="collapsible-content" :class="contentClass">
      <slot/>
    </div>
    <Button
      type="button"
      :color="buttonColor || undefined"
      :invert="buttonInvert"
      :size="buttonSize || undefined"
      :class="buttonClass"
      class="collapsible-toggle"
      @click="toggle"
    >
      <slot name="trigger" :is-open="isOpen">{{ isOpen ? closeLabel : openLabel }}</slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.collapsible-toggle {
  cursor: pointer;
}
</style>
