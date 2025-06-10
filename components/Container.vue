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
