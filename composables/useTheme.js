import { watch } from 'vue'
import { usePersistedRef } from './usePersistedRef'

// Light / dark / system for mini's dark mode (mini's css/scss/_dark_mode.scss):
// sets .dark-mode or .auto-dark-mode on document.body (mini's body#mini) and
// remembers the choice in localStorage under 'mini.theme'. "system" follows
// the operating system, live, through CSS alone.
//
//   const { theme } = useTheme()   // 'light' | 'dark' | 'system'; assign to change
//
// A project that also stores the choice elsewhere (jpm: on the account)
// assigns that value to `theme` once it arrives. Calls share one ref.
//
// So a dark page doesn't flash light before the app's JavaScript runs, put
// this right after <body id="mini"> in index.html:
//
//   <script>try{var t=JSON.parse(localStorage.getItem('mini.theme'));if(t==='dark'||t==='system')document.body.classList.add(t==='dark'?'dark-mode':'auto-dark-mode')}catch(e){}</script>

export const THEMES = ['light', 'dark', 'system']

export function applyTheme(theme, el = document.body) {
  el.classList.toggle('dark-mode', theme === 'dark')
  el.classList.toggle('auto-dark-mode', theme === 'system')
}

export function useTheme(defaultTheme = 'light') {
  const theme = usePersistedRef('mini.theme', defaultTheme)
  if (!THEMES.includes(theme.value)) theme.value = defaultTheme
  watch(theme, value => applyTheme(THEMES.includes(value) ? value : defaultTheme), { immediate: true })
  return { theme, themes: THEMES }
}
