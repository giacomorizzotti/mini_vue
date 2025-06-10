<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    height: {
      type: [Number, String],
      default: null
    }
  })
const spaceClass = computed(() => {
  const classes = ['space']
  // Color
  if (props.height) {
    classes.push("space-"+props.height)
  } else {
    classes.push("space-1")
  }
  return classes
})
</script>

<template>
  <div :class="spaceClass"></div>
</template>

<style lang="scss" scoped>
</style>
