<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    title: {
      type: [Number,String]
    },
    background: [String],
    pageMenu: {
      type: [Boolean],
    }
  })
  
  // Color mapping
  const colorClassMap = {
    wh: 'white', white: 'white', fw: 'false-white', 'false-white': 'false-white',
    lg: 'light-grey', 'light-grey': 'light-grey', grey: 'grey',
    dg: 'dark-grey', 'dark-grey': 'dark-grey', fb: 'false-black', 'false-black': 'false-black',
    bk: 'black', black: 'black', col: 'main-color', color: 'main-color', 'main-color': 'main-color',
    'col-dark': 'main-color-dark', 'color-dark': 'main-color-dark', 'main-color-dark': 'main-color-dark',
    'second-col': 'second-color', 'second-color': 'second-color',
    'second-col-dark': 'second-color-dark', 'second-color-dark': 'second-color-dark',
    'third-col': 'third-color', 'third-color': 'third-color',
    'third-col-dark': 'third-color-dark', 'third-color-dark': 'third-color-dark',
    'fourth-col': 'fourth-color', 'fourth-color': 'fourth-color',
    'fourth-col-dark': 'fourth-color-dark', 'fourth-color-dark': 'fourth-color-dark',
    'link': 'link','link-color': 'link',
    info: 'info', success: 'success', warning: 'warning', danger: 'danger', bad: 'bad',
    'acid-green': 'acid-green', gingerbread: 'gingerbread',
    mini: 'mini', 'mini-dark': 'mini-dark', 'mini-second': 'mini-second', 'mini-third': 'mini-third', 'mini-fourth': 'mini-fourth',
    uwa: 'uwa', 'uwa-dark': 'uwa-dark', 'uwa-second': 'uwa-second', 'uwa-third': 'uwa-third', 'uwa-fourth': 'uwa-fourth', 'uwa-link': 'uwa-link',
    aroma: 'aroma', 'aroma-dark': 'aroma-dark',
    pdp: 'pdp', 'pdp-second': 'pdp-second', 'pdp-third': 'pdp-third', 'pdp-fourth': 'pdp-fourth',
    lns: 'lns', 'lns-dark': 'lns-dark',
    dt: 'dt'
  }

  const sectionClass = computed(() => {
    const classes = ['container', 'fw']
    if (props.pageMenu) {
      classes.push('page-menu')
    }
    // Background color
    if (props.background && colorClassMap[props.background]) {
      classes.push(colorClassMap[props.background]+'-bg')
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
</style>
