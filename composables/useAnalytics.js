/**
 * GA4 page-view tracking, gated on cookie consent. Fully generic (a
 * measurement id + page-view tracking) -- no consuming project's domain
 * model involved, same reasoning useWeekNavigation/useTimeGrid/etc. already
 * followed for other cross-project composables extracted from jpm.
 *
 * Deliberately event-driven rather than independently re-reading the
 * consent cookie GDPR.vue already owns: that component already reliably
 * re-emits @accept/@deny on every mount (reflecting whatever was decided on
 * a previous visit, not just a fresh interactive choice), so a consumer
 * wiring `<GDPR @accept="analytics.enable()" @deny="analytics.disable()">`
 * gets correct behavior on first load and on every later change, with no
 * second place independently guessing GDPR.vue's own cookie name.
 *
 * enable()/injectScript are a no-op with no measurementId -- lets a
 * consuming project wire this in unconditionally and simply leave its own
 * GA measurement-id env var unset in local dev, rather than needing an
 * extra guard at every call site.
 */

// Module-level, not per-call-instance: the gtag.js script tag and
// dataLayer must only ever be injected once per page, regardless of how
// many components call useAnalytics().
let scriptInjected = false
let enabled = false

function gtag(...args) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

function injectScript(measurementId) {
  if (scriptInjected) return
  scriptInjected = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
  gtag('js', new Date())
  // send_page_view: false -- GA4's own auto page-view doesn't fire on SPA
  // client-side route changes anyway; trackPageView() below is the one
  // path that actually reports a page view, called explicitly from a
  // router afterEach hook, so there's no reason to also let gtag.js send
  // its own automatic one for the very first load.
  gtag('config', measurementId, { send_page_view: false })
}

export function useAnalytics(measurementId) {
  function enable() {
    if (!measurementId) return
    injectScript(measurementId)
    enabled = true
  }

  function disable() {
    // No script-unload step here -- GDPR.vue's own deny() already clears
    // every _ga*/_gid/_gat* cookie on the same consent change, the actual
    // mechanism that stops GA from identifying this browser again. This
    // flag just stops *this app* from pushing any further events in the
    // current page session.
    enabled = false
  }

  function trackPageView(path) {
    if (!enabled) return
    gtag('event', 'page_view', { page_path: path })
  }

  return { enable, disable, trackPageView }
}
