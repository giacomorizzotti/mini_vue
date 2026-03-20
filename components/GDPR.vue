<script setup>
import { ref, computed, onMounted } from 'vue'
const choose=ref(false)
const bannerMinified=ref(false)
const blackLayer = ref(true)
const privacy=ref(null)

  const props = defineProps({
    googleAnalyticsCode: {
      type: [String],
      default: null
    },
  })

const getPrivacyStatus = computed(() => {
    if (privacy.value === null)
        return 'nessuna scelta effettuata'
    if (privacy.value === false)
        return 'no (solo cookie tecnici)'
    if (privacy.value === true)
        return 'si'
})

const toggleBanner = computed(() => {
    if (choose.value === false)
        privacyDeny()
    bannerMinified.value = !bannerMinified.value 
})

const makeChoice = () => {
    document.body.style.height=null
    document.body.style.overflow=null
    blackLayer.value = false
    choose.value = true
}

const privacyConsent = () => {
    makeChoice()
    privacy.value = true
    localStorage.setItem('gdprConsent', 'true')
}

const privacyDeny = () => {
    makeChoice()
    privacy.value = false
    localStorage.setItem('gdprConsent', 'false')
    // Disable Google Analytics
    window['ga-disable-'+props.googleAnalyticsCode] = true
    document.cookie = '_ga=; Max-Age=0; path=/'
    document.cookie = '_gid=; Max-Age=0; path=/'
}

onMounted(() => {
    const consent = localStorage.getItem('gdprConsent')
    if (consent === 'true') {
        privacyConsent()
        bannerMinified.value = true
    } else if (consent === 'false') {
        privacyDeny()
        bannerMinified.value = true
    } else {
        document.body.style.height = "100%"
        document.body.style.overflow = "hidden"
    }
})

</script>

<template>
<div v-if="blackLayer && props.googleAnalyticsCode" id="black-layer" :class="{ 'gone' : !blackLayer }"></div>
<div v-if="props.googleAnalyticsCode" id="consent-banner" :class="[ bannerMinified ? 'mini' : 'full' ]" @click="toggleBanner">
    <p class="cookie-icon">🍪</p>
    <a class="close-cookie-banner">X</a>
    <div class="cookie-banner-content">
        <div class="consent-label">
            <p class="cookie-desc wh-text L">
                Utilizziamo dei cookie
            </p>
            <p class="cookie-desc wh-text S">
                Lo facciamo solo per tenere traccia delle visite su questo sito; 
                scegli tu se ce lo vuoi permettere.<br/> Magiori informazioni nella 
                <router-link :to="{ name: 'privacy-policy' }" class="">privacy policy</router-link> 
                e nella <router-link :to="{ name: 'cookie-policy' }" class="">cookie policy</router-link>.
            </p>
        </div>
        <div class="consent-buttons">
            <button class="btn wh-btn L consent" @click="privacyConsent">Accetta</button>
            <button class="btn wh-btn-invert L consent" @click="privacyDeny">Rifiuta (solo cookie tecnici)</button>
        </div>
        <p v-if="choose===true" class="consent-status">Scelta: {{ getPrivacyStatus }}</p>
    </div>
</div>
</template>

<style lang="scss" scoped>
</style>
