function normalizeHex(hex) {
  let value = String(hex).trim().replace(/^#/, '')
  if (value.length === 3) {
    value = value.split('').map(c => c + c).join('')
  }
  return value
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex)
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

/**
 * Perceived brightness of a hex color, 0 (black) - 255 (white), using the
 * YIQ formula — a cheap approximation, good enough for picking a readable
 * text color over a background swatch.
 * @param {string} hex
 * @returns {number}
 */
function getBrightness(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 255
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
}

/**
 * @param {string} hex - background color, e.g. '#cccccc'
 * @param {number} threshold - brightness cutoff (0-255), default 128
 * @returns {boolean}
 */
function isLightColor(hex, threshold = 182) {
  return getBrightness(hex) > threshold
}

/**
 * WCAG relative luminance of a hex color, 0 (black) - 1 (white).
 * @param {string} hex
 * @returns {number}
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Pick a readable text color class for a given background hex color: dark
 * text wherever it contrasts more than white does (WCAG contrast ratio).
 * Mid-tone swatches like '#e6a064' get dark text (about 9.6:1) instead of
 * the white (2.2:1) the brightness cutoff in isLightColor gives them.
 * @param {string} hex - background color, e.g. '#cccccc'
 * @param {string} lightClass - class to use over light backgrounds
 * @param {string} darkClass - class to use over dark backgrounds
 * @returns {string}
 */
function getContrastClass(hex, lightClass = 'black-text', darkClass = 'white-text') {
  if (!hexToRgb(hex)) return isLightColor(hex) ? lightClass : darkClass
  const luminance = getLuminance(hex)
  const againstBlack = (luminance + 0.05) / 0.05
  const againstWhite = 1.05 / (luminance + 0.05)
  return againstBlack >= againstWhite ? lightClass : darkClass
}

/**
 * Composable for picking readable text colors against arbitrary background colors.
 * @returns {Object} Color contrast utilities
 */
export function useColorContrast() {
  return { getBrightness, getLuminance, isLightColor, getContrastClass }
}
