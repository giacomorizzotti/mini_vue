<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    width: {
      type: [Number, String],
      default: null
    },
    background: [String],
    fw: {
      type:[Boolean], 
      default:false
    },
  })
  
  // Color mapping
  const colorClassMap = {
    wh: 'white', white: 'white', fw: 'false-white', 'false-white': 'false-white',
    lg: 'light-grey', 'light-grey': 'light-grey', grey: 'grey', dg: 'dark-grey', 'dark-grey': 'dark-grey', 
    fb: 'false-black', 'false-black': 'false-black', bk: 'black', black: 'black', 
    col: 'main-color', color: 'main-color', 'main-color': 'main-color',
    'col-dark': 'main-color-dark', 'color-dark': 'main-color-dark', 'main-color-dark': 'main-color-dark',
    'second': 'second-color', 'second-color': 'second-color',
    'second-dark': 'second-color-dark', 'second-color-dark': 'second-color-dark',
    'third': 'third-color', 'third-color': 'third-color',
    'third-dark': 'third-color-dark', 'third-color-dark': 'third-color-dark',
    'fourth': 'fourth-color', 'fourth-color': 'fourth-color',
    'fourth-dark': 'fourth-color-dark', 'fourth-color-dark': 'fourth-color-dark',
    'link': 'link','link-color': 'link',
    'link-hover': 'link-hover',
    info: 'info', success: 'success', warning: 'warning', danger: 'danger', bad: 'bad',
    'acid-green': 'acid-green', gingerbread: 'gingerbread',
    blue: 'blue', 'light-blue': 'light-blue', 'dark-blue': 'dark-blue',
    mini: 'mini', 'mini-dark': 'mini-dark', 'mini-second': 'mini-second', 'mini-third': 'mini-third', 'mini-fourth': 'mini-fourth',
    uwa: 'uwa', 'uwa-dark': 'uwa-dark', 'uwa-second': 'uwa-second', 'uwa-third': 'uwa-third', 'uwa-fourth': 'uwa-fourth', 'uwa-link': 'uwa-link',
    dt: 'dt'
  }

  const containerClass = computed(() => {
    const classes = ['container']

    // Container width
    if (props.width === 'fw' || props.width === 'full-width') {
      classes.push('fw')
    } else if (props.width === 'thin') {
      classes.push('thin')
    } else if (props.width === 'wide') {
      classes.push('wide')
    }
    if (props.fw === true) {
      classes.push('fw')
    }
    
    // Background color
    if (props.background && colorClassMap[props.background]) {
      classes.push(colorClassMap[props.background]+'-bg')
    } 
    
    return classes
  })
</script>

<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
</style>
