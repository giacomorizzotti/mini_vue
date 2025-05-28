<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    title: {
      type: [Number,String],
      default: "section title"
    },
    pageMenu: {
      type: [Boolean],
    }
  })
  const sectionClass = computed(() => {
    const classes = ['container']
    if (props.pageMenu) {
      classes.push('page-menu')
    }
    return classes
  })
</script>

<template>
  <section :id="props.title.replace(/\s+/g, '-').toLowerCase()":class="sectionClass" :title="props.title">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
</style>
