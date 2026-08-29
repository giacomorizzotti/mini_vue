<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { HalfCookie } from '@iconoir/vue'

// ── Emits ────────────────────────────────────────────────────────────────────
// @accept — fired on mount if already accepted, or when user clicks Accept
// @deny   — fired on mount if already denied,   or when user clicks Deny
const emit = defineEmits(['accept', 'deny'])

// ── Props ─────────────────────────────────────────────────────────────────────
// lang:         override language ('it' | 'en' | any key in translations)
//               null = auto-detect from <html lang>
// translations: merge with (or extend) the built-in strings for buttons /
//               status text; use #title and #description slots for the body.
//
// Slot usage — inject custom content per project:
//   <GDPR>
//     <template #title>Your heading</template>
//     <template #description>
//       Your text with <a href="/privacy">policy link</a>
//     </template>
//   </GDPR>
const props = defineProps({
  lang:         { type: String, default: null },
  translations: { type: Object, default: () => ({}) },
})

// ── i18n ──────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  it: {
    title:         'Utilizziamo cookie analitici',
    desc:          'Questo sito utilizza cookie analitici di terze parti per misurare le visite e migliorare l\'esperienza di navigazione. I dati sono raccolti in forma anonima e aggregata. Nessun cookie analitico viene salvato senza il tuo consenso esplicito.',
    changeNote:    'Puoi modificare le tue preferenze in qualsiasi momento cliccando sull\'icona 🍪 in basso.',
    privacyLink:   'Privacy policy',
    cookieLink:    'Cookie policy',
    denyBtn:       'Solo cookie tecnici',
    acceptBtn:     'Accetta tutti',
    statusPrefix:  'Scelta:',
    statusGranted: 'sì',
    statusDenied:  'no',
  },
  en: {
    title:         'We use analytics cookies',
    desc:          'This site uses third-party analytics cookies to measure visits and improve your browsing experience. Data is collected in anonymous and aggregated form. No analytics cookie is saved without your explicit consent.',
    changeNote:    'You can update your preferences at any time by clicking the 🍪 icon below.',
    privacyLink:   'Privacy policy',
    cookieLink:    'Cookie policy',
    denyBtn:       'Technical cookies only',
    acceptBtn:     'Accept all',
    statusPrefix:  'Choice:',
    statusGranted: 'yes',
    statusDenied:  'no',
  },
  fr: {
    title:         'Nous utilisons des cookies analytiques',
    desc:          'Ce site utilise des cookies analytiques tiers pour mesurer les visites et améliorer votre expérience de navigation. Les données sont collectées de façon anonyme et agrégée. Aucun cookie analytique n\'est enregistré sans votre consentement explicite.',
    changeNote:    'Vous pouvez modifier vos préférences à tout moment en cliquant sur l\'icône 🍪 ci-dessous.',
    privacyLink:   'Politique de confidentialité',
    cookieLink:    'Politique de cookies',
    denyBtn:       'Cookies techniques uniquement',
    acceptBtn:     'Tout accepter',
    statusPrefix:  'Choix :',
    statusGranted: 'oui',
    statusDenied:  'non',
  },
  de: {
    title:         'Wir verwenden Analyse-Cookies',
    desc:          'Diese Website verwendet Analyse-Cookies von Drittanbietern, um Besuche zu messen und die Nutzererfahrung zu verbessern. Die Daten werden anonym und aggregiert erfasst. Ohne deine ausdrückliche Zustimmung wird kein Analyse-Cookie gespeichert.',
    changeNote:    'Du kannst deine Einstellungen jederzeit über das 🍪-Symbol unten ändern.',
    privacyLink:   'Datenschutzerklärung',
    cookieLink:    'Cookie-Richtlinie',
    denyBtn:       'Nur technische Cookies',
    acceptBtn:     'Alle akzeptieren',
    statusPrefix:  'Auswahl:',
    statusGranted: 'ja',
    statusDenied:  'nein',
  },
}

function getLang() {
  return props.lang
    ?? document.documentElement.lang?.split('-')[0]
    ?? 'it'
}

function t(key) {
  const lang = getLang()
  // prop overrides → built-in for detected lang → Italian fallback → key name
  return props.translations[lang]?.[key]
    ?? TRANSLATIONS[lang]?.[key]
    ?? TRANSLATIONS.it[key]
    ?? key
}

// ── Cookies ──────────────────────────────────────────────────────────────────
const COOKIE_NAME = 'consent_banner'
const COOKIE_DAYS = 365
const GA_COOKIES  = ['_ga', '_gid', '_gat']

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getCookie(name) {
  const row = document.cookie.split('; ').find(r => r.startsWith(name + '='))
  return row ? decodeURIComponent(row.split('=')[1]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

// ── State ────────────────────────────────────────────────────────────────────
// bannerState: null (hidden) | 'open' | 'mini' — mirrors CSS classes
const bannerState   = ref(null)
const overlayActive = ref(false)
const overlayFading = ref(false)

function readStatus() {
  const raw = getCookie(COOKIE_NAME)
  if (raw === 'yes') return 'granted'   // v1 localStorage migration
  if (raw === 'no')  return 'denied'
  return raw  // 'granted' | 'denied' | null
}

const status     = computed(readStatus)
const statusText = computed(() => {
  if (status.value === 'granted') return t('statusGranted')
  if (status.value === 'denied')  return t('statusDenied')
  return null
})

// ── Overlay ──────────────────────────────────────────────────────────────────
function showOverlay() {
  overlayActive.value = true
  overlayFading.value = false
}

function hideOverlay() {
  overlayFading.value = true
  setTimeout(() => {
    overlayActive.value = false
    overlayFading.value = false
  }, 350)
}

// ── Actions ──────────────────────────────────────────────────────────────────
function accept() {
  setCookie(COOKIE_NAME, 'granted', COOKIE_DAYS)
  document.body.classList.remove('consent-pending')
  hideOverlay()
  bannerState.value = 'mini'
  emit('accept')
}

function deny() {
  setCookie(COOKIE_NAME, 'denied', COOKIE_DAYS)
  document.body.classList.remove('consent-pending')
  hideOverlay()
  bannerState.value = 'mini'
  GA_COOKIES.forEach(deleteCookie)
  emit('deny')
}

function open() {
  bannerState.value = 'open'
}

function close() {
  if (status.value) bannerState.value = 'mini'
}

function handleBannerClick() {
  if (bannerState.value === 'mini') open()
}

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  const s = readStatus()
  if (s === 'granted') {
    bannerState.value = 'mini'
    emit('accept')
  } else if (s === 'denied') {
    bannerState.value = 'mini'
    emit('deny')
  } else {
    document.body.classList.add('consent-pending')
    showOverlay()
    bannerState.value = 'open'
  }
})
</script>

<template>
  <!-- Backdrop overlay — fades out via .gone before being removed from DOM -->
  <div
    v-if="overlayActive"
    id="consent-overlay"
    :class="{ gone: overlayFading }"
  ></div>

  <!-- Banner — .open (full) or .mini (collapsed), hidden when bannerState is null -->
  <div
    id="consent-banner"
    :class="bannerState"
    @click="handleBannerClick"
  >
    <p class="cookie-icon lh-08"><HalfCookie class="white-text" width="32px" height="32px"/></p>
    <a data-consent-close @click.stop="close">×</a>

    <!-- @click.stop on the wrapper: any click inside (including slotted links)
         is contained and won't re-trigger handleBannerClick on the parent -->
    <div class="cookie-banner-content" @click.stop>
      <div class="consent-label">
        <p class="cookie-desc wh-text L">
          <slot name="title">{{ t('title') }}</slot>
        </p>
        <p class="cookie-desc wh-text">
          <slot name="description">
            {{ t('desc') }}<br/>
            {{ t('changeNote') }}<br/>
            <RouterLink :to="{ name: 'privacy-policy' }">{{ t('privacyLink') }}</RouterLink> ·
            <RouterLink :to="{ name: 'cookie-policy' }">{{ t('cookieLink') }}</RouterLink>
          </slot>
        </p>
      </div>

      <div class="consent-buttons">
        <button class="btn wh-btn-invert L consent" @click="deny">{{ t('denyBtn') }}</button>
        <button class="btn wh-btn L consent" @click="accept">{{ t('acceptBtn') }}</button>
      </div>

      <!-- Shown in .mini state via CSS; hidden in .open state -->
      <p v-if="statusText" class="consent-status">{{ t('statusPrefix') }} {{ statusText }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Links inside the banner sit on a dark background, so override the global
// link color (var(--link-color) is typically dark) to white here.
.cookie-banner-content a {
  color: var(--white);
  text-decoration: underline;
  &:hover {
    color: var(--white);
    opacity: 0.75;
  }
}
</style>
