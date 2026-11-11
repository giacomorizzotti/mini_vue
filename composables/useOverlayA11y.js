import { watch, nextTick, onUnmounted } from 'vue'

/**
 * Keyboard and screen-reader behaviour shared by Modal and SubNavigation.
 *
 * Every open overlay is registered here, and only the one drawn on top acts
 * on the keyboard: Esc closes it alone (not every mounted overlay at once),
 * and Tab cycles within it instead of wandering into the page behind.
 * Opening moves focus onto the panel, closing hands it back to whatever had
 * it before, and the panel is named after its first heading unless it
 * already has a name.
 *
 * "On top" is decided visually, by the z-index of the overlay's fixed
 * container and then document order, not by which one opened last: a deep
 * link can make a modal visible a moment before the panel it sits on.
 *
 * Tab is caught twice: on keydown, using the focusable elements found in the
 * panel, and by two focus guards the component renders at the panel's start
 * and end (`onGuardFocus`). The guards catch whatever the list misses, such
 * as scrollable areas that Chrome makes tabbable on its own.
 */
const open = new Set()

const CLOSE_LABELS = { en: 'Close', it: 'Chiudi', fr: 'Fermer', de: 'Schließen', es: 'Cerrar' }

/** "Close" in the page's language (<html lang>), for icon-only close buttons. */
export function closeLabel() {
  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase()
  return CLOSE_LABELS[lang] ?? CLOSE_LABELS.en
}

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'iframe', '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusables(panel) {
  return [...panel.querySelectorAll(FOCUSABLE)]
    .filter(el => !el.hasAttribute('data-focus-guard') && el.getClientRects().length > 0)
}

function zIndexOf(panel) {
  for (let el = panel; el && el !== document.body; el = el.parentElement) {
    const style = getComputedStyle(el)
    if (style.position === 'fixed') return parseInt(style.zIndex, 10) || 0
  }
  return 0
}

function topEntry() {
  let top = null
  for (const entry of open) {
    const panel = entry.getPanel()
    if (!panel || !panel.getClientRects().length) continue
    if (!top) { top = { entry, panel, z: zIndexOf(panel) }; continue }
    const z = zIndexOf(panel)
    const later = top.panel.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING
    if (z > top.z || (z === top.z && later)) top = { entry, panel, z }
  }
  return top
}

let headingIds = 0
function labelFromHeading(panel) {
  if (panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) return
  const heading = panel.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]')
  if (!heading) return
  if (!heading.id) heading.id = `overlay-heading-${++headingIds}`
  panel.setAttribute('aria-labelledby', heading.id)
}

function focusEdge(panel, last) {
  const items = focusables(panel)
  const target = last ? items[items.length - 1] : items[0]
  ;(target ?? panel).focus({ preventScroll: !target })
}

function trapTab(e, panel) {
  const items = focusables(panel)
  const active = document.activeElement
  // From the panel itself (where focus lands on open), Tab goes to the first
  // control: left alone, the browser would hit the start guard and wrap to
  // the last one.
  if (!items.length || !panel.contains(active) || active === panel) {
    e.preventDefault()
    focusEdge(panel, e.shiftKey)
  } else if (e.shiftKey && active === items[0]) {
    e.preventDefault()
    focusEdge(panel, true)
  } else if (!e.shiftKey && active === items[items.length - 1]) {
    e.preventDefault()
    focusEdge(panel, false)
  }
}

function isUsable(el) {
  return el?.isConnected && typeof el.focus === 'function' && el.getClientRects().length > 0
}

/**
 * @param {() => boolean} isOpen - whether the overlay is currently shown
 * @param {() => HTMLElement|null} getPanel - the dialog element (needs tabindex="-1")
 * @param {() => void} onClose - what Esc does when this overlay is on top
 * @returns {{ onGuardFocus: (edge: 'start'|'end') => void }} for the focus
 *   guards: render `<span data-focus-guard tabindex="0" @focus="onGuardFocus('start')"/>`
 *   as the panel's first child and the same with 'end' as its last.
 */
export function useOverlayA11y(isOpen, getPanel, onClose) {
  const entry = { getPanel }
  let returnFocusTo = null

  function isTop() {
    return topEntry()?.entry === entry
  }

  // Each overlay has its own listener, and a real key event lets Vue
  // re-render between listeners: once the top overlay has closed, the one
  // beneath would find itself on top and close too. So whoever handles a key
  // marks it with preventDefault and the rest skip it. That also leaves Esc
  // alone when a control inside handled it first (a popup in a textarea).
  function onKeydown(e) {
    if (e.defaultPrevented || (e.key !== 'Escape' && e.key !== 'Tab') || !isTop()) return
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else {
      trapTab(e, getPanel())
    }
  }

  function onGuardFocus(edge) {
    const panel = getPanel()
    if (panel) focusEdge(panel, edge === 'start')
  }

  function activate() {
    if (open.has(entry)) return
    returnFocusTo = document.activeElement
    open.add(entry)
    nextTick(() => {
      const panel = getPanel()
      if (!panel) return
      labelFromHeading(panel)
      if (isTop() && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true })
    })
  }

  function deactivate() {
    if (!open.delete(entry)) return
    const target = returnFocusTo
    returnFocusTo = null
    nextTick(() => {
      if (isUsable(target)) target.focus({ preventScroll: true })
      else topEntry()?.panel.focus({ preventScroll: true })
    })
  }

  window.addEventListener('keydown', onKeydown)
  watch(isOpen, visible => (visible ? activate() : deactivate()), { immediate: true })
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    deactivate()
  })

  return { onGuardFocus }
}
