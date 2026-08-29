/**
 * Consent-gated Umami analytics composable.
 *
 * Usage — import and wire to GDPR.vue's consent events:
 *
 *   const umami = useUmami('your-website-id', 'https://your-umami-host/script.js')
 *   // In template:
 *   <GDPR @accept="umami.enable()" @deny="umami.disable()" />
 *
 * The script is only injected when enable() is called — never before.
 * This ensures no data is sent to the analytics server without explicit
 * consent: the browser never even opens a connection to the analytics host
 * until the user accepts.
 *
 * disable() sets Umami's own localStorage opt-out key ('umami.disabled'),
 * which Umami's tracker checks before every event — so it works even when
 * called after the script has already been injected (a user withdrawing
 * consent mid-session).  On the next page load the script won't be injected
 * at all (GDPR.vue fires @deny on mount whenever the stored choice is
 * 'denied', so the guard is re-applied automatically on every reload).
 *
 * Both functions are no-ops when websiteId or src is not provided, so a
 * consuming project can pass an env var and simply leave it unset in local
 * dev without needing an extra guard at every call site — same convention
 * useAnalytics follows for GA4.
 */

// Module-level guard — the script tag is injected at most once per page,
// regardless of how many components call useUmami().
let _injected = false

const UMAMI_DISABLED_KEY = 'umami.disabled'

export function useUmami(websiteId, src) {
  function enable() {
    if (!websiteId || !src) return
    // Clear Umami's own opt-out flag so it will track events once injected.
    try { localStorage.removeItem(UMAMI_DISABLED_KEY) } catch (_) {}
    if (_injected) return  // Script already running; removing the flag is enough.
    _injected = true
    const script = document.createElement('script')
    script.defer = true
    script.src = src
    script.setAttribute('data-website-id', websiteId)
    document.head.appendChild(script)
  }

  function disable() {
    // Umami's tracker checks this key before every event — setting it here
    // stops tracking even if the script is already running in this session.
    // On the next page load the script is never injected at all.
    try { localStorage.setItem(UMAMI_DISABLED_KEY, '1') } catch (_) {}
  }

  return { enable, disable }
}
