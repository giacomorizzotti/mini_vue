import { ref } from 'vue'

const isMenuOpen = ref(false)
const menuStateClass = ref('closed-menu')

export function useMenuState() {

  function menuToggle() {
    isMenuOpen.value = !isMenuOpen.value
    if ( isMenuOpen.value == true ) { 
      menuStateClass.value = 'open-menu' 
    } else {
      window.scrollTo(0,0)
      menuStateClass.value = 'closed-menu'
    }
  }
  
  return { isMenuOpen, menuStateClass, menuToggle }
  
}