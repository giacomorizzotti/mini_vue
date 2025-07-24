<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    title: {
      type: [Number,String]
    },
    pageMenu: {
      type: [Boolean],
    }
  })

  const sectionClass = computed(() => {
    const classes = ['container', 'fw']
    if (props.pageMenu) {
      classes.push('page-menu')
    }
    return classes
  })
</script>

<template>
  <section
    :id="props.title ? props.title.replace(/\s+/g, '-').toLowerCase() : undefined"
    :class="sectionClass"
    :title="props.title ? props.title : undefined"
  >
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  margin: 0 auto;
  position: relative;
  max-width: calc(var(--max-screen) * 0.75);
  @media only screen and (min-width: 992px) {
    max-width: calc(var(--max-screen) * 1);
  }
  &.fw, &.full-width {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
    &.forced {
      min-width: 100vw;
      width: 100vw;
      max-width: 100vw;
      left: 50%;
      transform: translate(-50%, 0);
    }
  }
  &.thin {
    max-width: calc(var(--max-screen) * 0.5);
    @media only screen and (min-width: 992px) {
      max-width: calc(var(--max-screen) * 0.75);
    }
  }
  &.wide {
    max-width: calc(var(--max-screen) * 1);
    @media only screen and (min-width: 992px) {
      max-width: calc(var(--max-screen) * 1.25);
    }
  }
}
</style>
