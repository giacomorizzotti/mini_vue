import { ref, onMounted } from 'vue'
import { useCookies } from './useCookies'

/**
 * Composable for managing website settings via cookies
 * @returns {Object} Website settings utilities
 */
export function useWebsiteSettings() {
  const { setCookie, readCookie } = useCookies()
  const settings = ref({})

  /**
   * Update website settings cookie
   */
  const updateSettings = () => {
    setCookie('website', JSON.stringify(settings.value))
  }

  /**
   * Load settings from cookie
   */
  const loadSettings = () => {
    const savedSettings = readCookie('website')
    if (savedSettings) {
      try {
        settings.value = JSON.parse(savedSettings)
      } catch (e) {
        console.error('Failed to parse website settings:', e)
        settings.value = {}
      }
    } else {
      settings.value = {}
      updateSettings()
    }
  }

  /**
   * Set a specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  const setSetting = (key, value) => {
    settings.value[key] = value
    updateSettings()
  }

  /**
   * Get a specific setting
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Setting value
   */
  const getSetting = (key, defaultValue = null) => {
    return settings.value[key] ?? defaultValue
  }

  onMounted(() => {
    loadSettings()
  })

  return {
    settings,
    updateSettings,
    loadSettings,
    setSetting,
    getSetting
  }
}
