/**
 * Composable for cookie management
 * @returns {Object} Cookie utilities
 */
export function useCookies() {
  /**
   * Set a cookie
   * @param {string} cname - Cookie name
   * @param {string} cvalue - Cookie value
   * @param {number} exdays - Expiration days (default: 30)
   * @param {string} path - Cookie path (default: '/')
   * @param {string|number} domain - Cookie domain (0 = none, 1 = current hostname)
   */
  const setCookie = (cname, cvalue, exdays = 30, path = '/', domain = 0) => {
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    const expires = "expires=" + d.toUTCString()
    
    let domainToCookie = ""
    if (domain !== 0) {
      domainToCookie = "domain=" + domain + ";"
    } else if (domain === 1) {
      domainToCookie = "domain=" + window.location.hostname + ";"
    }

    document.cookie = `${cname}=${cvalue}; ${expires};path=${path};${domainToCookie}`
  }

  /**
   * Read a cookie
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  const readCookie = (name) => {
    const nameEQ = name + "="
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length)
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length)
      }
    }
    return null
  }

  /**
   * Delete a cookie
   * @param {string} name - Cookie name
   */
  const deleteCookie = (name) => {
    setCookie(name, "", -1, "/")
  }

  return {
    setCookie,
    readCookie,
    deleteCookie
  }
}
