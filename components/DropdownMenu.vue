<template>
  <li :class="['menu-item', 'drop-down', triggerClass]">
    <a 
      href="#" 
      @click.prevent="isMobile ? toggleDropdown() : null"
      @mouseover="!isMobile && hasHoverOpen ? openDropdown() : null"
      @mouseout="!isMobile && hasHoverClose ? closeDropdown() : null"
    >
      <slot name="trigger" :isOpen="isOpen">
        {{ label }}
      </slot>
    </a>
    
    <Transition name="dropdown">
      <ul 
        v-show="isOpen"
        class="menu drop-down"
      >
        <slot :isOpen="isOpen" :close="closeDropdown" />
      </ul>
    </Transition>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMobileDetection } from '../composables/useMobileDetection'

const props = defineProps({
  label: {
    type: String,
    default: 'Menu'
  },
  hoverOpen: {
    type: Boolean,
    default: false
  },
  hoverClose: {
    type: Boolean,
    default: false
  },
  clickToggle: {
    type: Boolean,
    default: false
  }
})

const { isMobile } = useMobileDetection()

const isOpen = ref(false)

const hasHoverOpen = computed(() => props.hoverOpen)
const hasHoverClose = computed(() => props.hoverClose)
const hasClickToggle = computed(() => props.clickToggle)

const triggerClass = computed(() => {
  const classes = []
  if (props.hoverOpen) classes.push('ho')
  if (props.hoverClose) classes.push('hc')
  if (props.clickToggle) classes.push('c')
  return classes.join(' ')
})

const openDropdown = () => {
  isOpen.value = true
}

const closeDropdown = () => {
  isOpen.value = false
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.menu-item.drop-down {
  position: relative;
}

.menu.drop-down {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  z-index: 1000;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
