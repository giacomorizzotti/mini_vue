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
    margin: {
      type: [Number, String],
      default: null
    },
    gap: {
      type: [Number, String],
      default: null
    },
    space: {
      type:[Boolean], 
      default:false
    },
    spaceTopBot: {
      type:[Boolean], 
      default:false
    },
    spaceTop: {
      type:[Boolean], 
      default:false
    },
    spaceBot: {
      type:[Boolean], 
      default:false
    },
    fh: {
      type:[Boolean],
      default:false
    },
    hh: {
      type:[Boolean],
      default:false
    },
    // Makes this Boxes' own width (not the viewport's) drive its .box
    // children's responsive sizing -- see mini's _box.scss for the
    // container-query mechanism this opts into. Off by default: existing
    // Boxes/Box usage everywhere is unaffected unless this is set.
    contain: {
      type:[Boolean],
      default:false
    },
  })
  // Mirror mini's _margins_paddings.scss $paddingThickness/$marginThickness labels
  const paddingClassMap = {
    0:'0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
    '025': '025', '05': '05', '075': '075', 15: '15', 25: '25'
  }
  const marginClassMap = {
    ...paddingClassMap,
    '-1': '-1', '-075': '-075', '-05': '-05', '-025': '-025', auto: 'auto'
  }
  // Mirror mini's _flexboxes.scss $multiplier labels (the g-* classes)
  const gapClassMap = {
    0:'0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 10: '10', 20: '20',
    '025': '025', '05': '05', '075': '075', 15: '15'
  }

  const boxesClass = computed(() => {
    const classes = ['boxes']
    
    // Gap
    // No truthiness check on props.gap, so a numeric :gap="0" works too
    // (same fix as padding and margin below).
    const gapClass = gapClassMap[props.gap] ? 'g-'+gapClassMap[props.gap] : null
    classes.push(gapClass)

    if (props.space === true || props.spaceTopBot === true) {
      classes.push('space-top-bot')
    }
    if (props.spaceTop === true) {
      classes.push('space-top')
    }
    if (props.spaceBot === true) {
      classes.push('space-bot')
    }

    // Margins and paddings
    const paddingClass = paddingClassMap[props.padding] ? 'p-'+paddingClassMap[props.padding] : null
    const marginClass = marginClassMap[props.margin] ? 'm-'+marginClassMap[props.margin] : null
    classes.push(paddingClass)
    classes.push(marginClass)

    // Full height
    if (props.fh === true) {
      classes.push('fh')
    }
    // Half height
    if (props.hh === true) {
      classes.push('hh')
    }

    // Containment context for children's responsive sizing (see _box.scss)
    if (props.contain === true) {
      classes.push('contain')
    }

    return classes
    
  })
</script>

<template>
  <div :class="boxesClass">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
</style>
