<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    size: {
      type: [Number, String],
      default: null
    },
    background: [String],
    square: {
      type:[Boolean], 
      default:false
    },
    padding: {
      type: [Number, String],
      default: null
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

  // Size mapping
  const sizeClassMap = {
    8: '8', 10: '10', 12: '12', 15: '15', 16: '16', 20: '20',
    25: '25', 30: '30', 33: '33', 40: '40', 50: '50',
    60: '60', 66: '66', 70: '70', 75: '75', 80: '80',
    88: '88', 90: '90', 100: '100'
  }
  // Size mapping
  const marginAndPaddingClassMap = {
    0:'0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
    '05': '05', 15: '15'
  }

  const boxClass = computed(() => {
    const classes = []

    // Size
    const sizeClass = props.size && sizeClassMap[props.size] ? 'box-'+sizeClassMap[props.size] : 'box'
    classes.push(sizeClass)

    // Margins and paddings
    const paddingClass = props.padding && marginAndPaddingClassMap[props.padding] ? 'p-'+marginAndPaddingClassMap[props.padding] : null
    const marginClass = props.margin && marginAndPaddingClassMap[props.margin] ? 'm-'+marginAndPaddingClassMap[props.margin] : null
    classes.push(paddingClass)
    classes.push(marginClass)
    
    // Background color
    if (props.background && colorClassMap[props.background]) {
      classes.push(colorClassMap[props.background]+'-bg')
    } 
    
    // Square
    if (props.square) {
      classes.push("square")
    } 

    return classes
    
  })
</script>

<template>
  <div :class="boxClass">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
</style>
