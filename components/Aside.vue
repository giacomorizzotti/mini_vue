<script setup>
  import { computed } from 'vue'
  import { useMenuState } from '@/mini/composables/useMenuState'
  const { menuStateClass } = useMenuState()
  import { useScrollState } from '@/mini/composables/useScrollState'
  const { scrollClass } = useScrollState()

  const props = defineProps({
    side: {
      type: [Number, String],
      default: null
    }
  })

  const asideId = computed(() => {
    const id = []
    if (props.side === 'left' || props.side === 'l') {
      id.push('side-left')
    } else if (props.side === 'right' || props.side === 'r') {
      id.push('side-right')
    }
  return id
  })

</script>

<template>
  <aside :id="asideId" :class="[scrollClass, menuStateClass]">
    <slot />
  </aside>
</template>

<style lang="scss" scoped>
// aside
aside#side-right, aside#side-left {
  transition: flex 0.2s ease-out;
  flex: 0 0 0;
  overflow: hidden;
}
aside#side-right {
  order: 2;
  @media only screen and (min-width: 992px) {
    order: 3;
  }
}
aside#side-left {
  transition: padding 0.2s ease, flex 0.2s ease-out;
  order: 1;
  @media only screen and (min-width: 992px) {
    order: 1;
  }
}
aside#side-right.open-menu, aside#side-left.open-menu {
  flex: 10;
  @media only screen and (min-width: 576px) {
    flex: 3;
  }
  @media only screen and (min-width: 768px) {
    flex: 2.5;
  }
  @media only screen and (min-width: 1400px) {
    flex: 2;
  }
  @media only screen and (min-width: 1920px) {
    flex: 2;
  }
}
</style>
<style lang="scss">
body.open-menu {
  aside#side-left.open-menu {
    padding-top: calc((var(--logo-height)) + var(--margin) * 2 + var(--padding) * 2 + var(--padding) * 2);
  }
  #sheet.open-menu {
    aside#side-left.open-menu {
      padding-top: var(--padding);
    }
  }
  aside#side-right.open-menu, aside#side-left.open-menu {
    flex: 10;
    @media only screen and (min-width: 576px) {
      flex: 3;
    }
    @media only screen and (min-width: 768px) {
      flex: 2.5;
    }
    @media only screen and (min-width: 1400px) {
      flex: 2;
    }
    @media only screen and (min-width: 1920px) {
      flex: 1.5;
    }
  }
}
</style>
