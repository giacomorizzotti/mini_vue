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
    fh: {
      type:[Boolean], 
      default:false
    },
  })
  // Size mapping
  const marginAndPaddingClassMap = {
    0:'0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
    '05': '05', 15: '15'
  }
  // Gap mapping
  const gapClassMap = {
    0:'0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
    '05': '05', 15: '15'
  }

  const boxesClass = computed(() => {
    const classes = ['boxes']
    
    // Gap
    const gapClass = props.gap && gapClassMap[props.gap] ? 'g-'+gapClassMap[props.gap] : null
    classes.push(gapClass)

    if (props.space === true || props.spaceTopBot === true) {
      classes.push('space-top-bot')
    }

    // Margins and paddings
    const paddingClass = props.padding && marginAndPaddingClassMap[props.padding] ? 'p-'+marginAndPaddingClassMap[props.padding] : null
    const marginClass = props.margin && marginAndPaddingClassMap[props.margin] ? 'm-'+marginAndPaddingClassMap[props.margin] : null
    classes.push(paddingClass)
    classes.push(marginClass)

    // Full height
    if (props.fh === true) {
      classes.push('fh')
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
