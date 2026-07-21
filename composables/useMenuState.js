import { ref } from 'vue'

const isMenuOpen = ref(false)
const menuStateClass = ref('closed-menu')

function applyOpen() {
  isMenuOpen.value = true
  menuStateClass.value = 'open-menu'
  document.body.classList.remove('closed-menu')
  document.body.classList.add('open-menu')
}

function applyClosed() {
  isMenuOpen.value = false
  menuStateClass.value = 'closed-menu'
  document.body.classList.remove('open-menu')
  document.body.classList.add('closed-menu')
}

function writeUrlParam(open) {
  const params = new URLSearchParams(window.location.search)
  params.set('menu', open ? 'open' : 'closed')
  history.replaceState(null, '', `${window.location.pathname}?${params}${window.location.hash}`)
}

// Restore state from URL on module load
if (new URLSearchParams(window.location.search).get('menu') === 'open') {
  applyOpen()
}

// Sync when browser history changes (back/forward)
window.addEventListener('popstate', () => {
  const param = new URLSearchParams(window.location.search).get('menu')
  if (param === 'open') applyOpen()
  else if (param === 'closed') applyClosed()
})

export function useMenuState() {
  function menuOpen() {
    applyOpen()
    writeUrlParam(true)
  }
  function menuClose() {
    applyClosed()
    writeUrlParam(false)
  }
  function menuToggle() {
    if (isMenuOpen.value) menuClose()
    else menuOpen()
  }

  return { isMenuOpen, menuStateClass, menuOpen, menuClose, menuToggle }
}
