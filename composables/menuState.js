import { ref } from 'vue'

const isMenuOpen = ref(false)
const isMenuOpenClass = ref(null)

export function menuState() {
  return {
    isMenuOpen
  }
}
export function getMenuStateClass() {
  if ( isMenuOpen.value ) { 
    isMenuOpenClass.value = 'open-menu' 
  } else {
    isMenuOpenClass.value = 'closed-menu'
  }
  return isMenuOpenClass
}