<script setup>
import { ref, computed } from 'vue'
const emit = defineEmits(['click'])

const props = defineProps({
  color: String,
  invert: Boolean,
  active: Boolean,
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
  dt: 'dt',
  grad: 'btn-grad',
  grad2: 'btn-grad-second',
  gradtwo: 'btn-grad-second',
}

// Size mapping
const sizeClassMap = {
  xs: 'XS', XS: 'XS', 'extra-small': 'XS',
  s: 'S', S: 'S', small: 'S',
  l: 'L', L: 'L', large: 'L',
  xl: 'XL', XL: 'XL', 'extra-large': 'XL',
  xxl: 'XXL', XXL: 'XXL', 'extra-extra-large': 'XXL'
}

// Corners mapping
const cornersClassMap = {
  smooth: 'smooth', round: 'round', hard: 'hard'
}

const buttonClasses = computed(() => {
  const classes = ['btn']

  // Color
  if (props.color && colorClassMap[props.color]) {
    classes.push(colorClassMap[props.color]+'-btn')
    if (props.invert || props.active) {
      classes.push(colorClassMap[props.color]+ '-btn-invert')
    }
  } else if (props.invert || props.active) {
    classes.push('btn-invert')
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

