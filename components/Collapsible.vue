<script setup>
import { ref, computed } from 'vue'

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

const buttonClasses = computed(() => {
  const classes = ['btn', 'collapsible-toggle']
  if (props.buttonSize) classes.push(props.buttonSize)
  if (props.buttonColor) {
    classes.push(props.buttonInvert ? `${props.buttonColor}-btn-invert` : `${props.buttonColor}-btn`)
  }
  if (props.buttonClass) classes.push(props.buttonClass)
  return classes
})

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="collapsible">
    <div v-show="isOpen" class="collapsible-content" :class="contentClass">
      <slot/>
    </div>
    <button type="button" :class="buttonClasses" @click="toggle">
      <slot name="trigger" :is-open="isOpen">{{ isOpen ? closeLabel : openLabel }}</slot>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.collapsible-toggle {
  cursor: pointer;
}
</style>
