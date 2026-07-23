// Reference-counted body scroll lock. Multiple callers (e.g. a Modal plus a
// ConfirmDialog stacked on top) can each hold a lock — the body stays locked
// until all have released it, so the first overlay to close doesn't
// re-enable scrolling while another is still open.
let lockCount = 0
let savedScrollY = 0

export function lockBodyScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.width = '100%'
  }
  lockCount++
}

export function unlockBodyScroll() {
  if (lockCount <= 0) return
  lockCount--
  if (lockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo(0, savedScrollY)
  }
}
