import { ref } from 'vue'

const isMenuOpen = ref(false)
const menuStateClass = ref('closed-menu')

export function useMenuState() {

  function menuOpen() {
    isMenuOpen.value = true
    menuStateClass.value = 'open-menu' 
    document.body.classList.remove('closed-menu');
    document.body.classList.add(menuStateClass.value);
  }
  function menuClose() {
    isMenuOpen.value = false
    menuStateClass.value = 'closed-menu'
    document.body.classList.remove('open-menu');
    document.body.classList.add(menuStateClass.value);
  }

  function menuToggle() {
    isMenuOpen.value = !isMenuOpen.value
    if ( isMenuOpen.value == true ) { 
      menuStateClass.value = 'open-menu' 
      document.body.classList.remove('closed-menu');
      document.body.classList.add(menuStateClass.value);
    } else {
      menuStateClass.value = 'closed-menu'
      document.body.classList.remove('open-menu');
      document.body.classList.add(menuStateClass.value);
    }
  }
  
  return { isMenuOpen, menuStateClass, menuOpen, menuClose, menuToggle }
  
}