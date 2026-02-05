<script setup>
import { ref, computed } from 'vue'
const emit = defineEmits(['click'])

const props = defineProps({
  color: String,
  invert: Boolean,
  text: {
    type: String,
  },
  size: [Number, String],
  link: String,
  corners: String,
  type: String,
  toggle: Boolean,
})

const isBeingClicked = ref(false)
const hasBeenClicked = ref(false)
function handleClick(event) {
  isBeingClicked.value = true
  setTimeout(() => {
    isBeingClicked.value = false
  }, 250)
  hasBeenClicked.value = !hasBeenClicked.value
  emit('click', event)
}

// Color mapping
const colorClassMap = {
  wh: 'white-btn', white: 'white-btn',
  fw: 'false-white-btn', 'false-white': 'false-white-btn',
  lg: 'light-grey-btn', 'light-grey': 'light-grey-btn',
  grey: 'grey-btn',
  dg: 'dark-grey-btn', 'dark-grey': 'dark-grey-btn',
  fb: 'false-black-btn', 'false-black': 'false-black-btn',
  bk: 'black-btn', black: 'black-btn',
  col: 'main-color-btn', color: 'main-color-btn', 'main-color': 'main-color-btn',
  'col-dark': 'main-color-dark-btn', 'color-dark': 'main-color-dark-btn', 'main-color-dark': 'main-color-dark-btn',
  'second-col': 'second-color-btn', 'second-color': 'second-color-btn',
  'second-col-dark': 'second-color-dark-btn', 'second-color-dark': 'second-color-dark-btn',
  'third-col': 'third-color-btn', 'third-color': 'third-color-btn',
  'third-col-dark': 'third-color-dark-btn', 'third-color-dark': 'third-color-dark-btn',
  'fourth-col': 'fourth-color-btn', 'fourth-color': 'fourth-color-btn',
  'fourth-col-dark': 'fourth-color-dark-btn', 'fourth-color-dark': 'fourth-color-dark-btn',
  info: 'info-btn', success: 'success-btn', warning: 'warning-btn', danger: 'danger-btn', bad: 'bad-btn',
  'acid-green': 'acid-green-btn', gingerbread: 'gingerbread-btn',
  mini: 'mini-btn', 'mini-dark': 'mini-dark-btn', 'mini-second': 'mini-second-btn', 'mini-third': 'mini-third-btn', 'mini-fourth': 'mini-fourth-btn',
  uwa: 'uwa-btn', 'uwa-dark': 'uwa-dark-btn', 'uwa-second': 'uwa-second-btn', 'uwa-third': 'uwa-third-btn', 'uwa-fourth': 'uwa-fourth-btn', 'uwa-link': 'uwa-link-btn',
  aroma: 'aroma-btn', 'aroma-dark': 'aroma-dark-btn',
  pdp: 'pdp-btn', 'pdp-second': 'pdp-second-btn', 'pdp-third': 'pdp-third-btn', 'pdp-fourth': 'pdp-fourth-btn',
  lns: 'lns-btn', 'lns-dark': 'lns-dark-btn',
  dt: 'dt-btn',
  grad: 'btn-grad',
  grad2: 'btn-grad-second',
  gradtwo: 'btn-grad-second',
}

// Size mapping
const sizeClassMap = {
  xs: 'xs', XS: 'xs', 'extra-small': 'xs',
  s: 's', S: 's', small: 's',
  l: 'l', L: 'l', large: 'l',
  xl: 'xl', XL: 'xl', 'extra-large': 'xl',
  xxl: 'xxl', XXL: 'xxl', 'extra-extra-large': 'xxl'
}

// Corners mapping
const cornersClassMap = {
  smooth: 'smooth', round: 'round', hard: 'hard'
}

const buttonClasses = computed(() => {
  const classes = ['btn']

  // Color
  if (props.color && colorClassMap[props.color]) {
    classes.push(colorClassMap[props.color])
    if (props.invert) {
      classes.push(colorClassMap[props.color]+ '-invert')
    }
  }

  // Size
  const sizeClass = props.size && sizeClassMap[props.size] ? sizeClassMap[props.size] : 'regular'
  classes.push(sizeClass)

  // Corners
  const cornerClass = props.corners && cornersClassMap[props.corners] ? cornersClassMap[props.corners] : 'smooth'
  classes.push(cornerClass)

  // Clicked
  if (isBeingClicked.value) {
    classes.push('clicking')
  }
  if (props.toggle && hasBeenClicked.value) {
    classes.push('clicked')
  }

  return classes
})
</script>

<template>
<a
  :href="props.link"
  :class="buttonClasses"
  :type="props.type"
  @click="handleClick"
>
  <slot/>{{ props.text }}
</a>
</template>

<style lang="scss" scoped>
</style>

