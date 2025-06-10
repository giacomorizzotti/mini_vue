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
            <button class="btn wh-btn invert L consent" @click="privacyDeny">Rifiuta (solo cookie tecnici)</button>
        </div>
        <p v-if="choose===true" class="consent-status">Scelta: {{ getPrivacyStatus }}</p>
    </div>
</div>
</template>

<style lang="scss" scoped>
#black-layer {
    position: fixed;
    z-index: 900;
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0 0 0 / 85%);
    transition: all 0.25s ease-in;
    &.gone {
        opacity: 0;
        width: 0;
        height: 0;
        background-color: rgb(0 0 0 / 0%);
        border-top-left-radius: 100%;
    }
}
#consent-banner {
    position: fixed;
    z-index: 901;
    top: auto;
    bottom: 0;
    left: auto;
    width: 75%;
    -webkit-box-shadow: 0 0 0 3px rgb(0 0 0 / 25%);
    -moz-box-shadow: 0 0 0 3px rgb(0 0 0 / 25%);
    box-shadow: 0 0 0 3px rgb(0 0 0 / 25%);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    right: 10%;
    display: flex;
    flex-flow: row wrap;
    padding: calc( var(--padding) * 1.5 );
    transform: translate(0, calc( var(--padding) * 0.25 ) );
    background: var(--gingerbread);
    -webkit-border-top-left-radius: 15px;
    -webkit-border-top-right-radius: 15px;
    -moz-border-radius-topleft: 15px;
    -moz-border-radius-topright: 15px;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    @media only screen and (min-width: 768px) {
        width: 50%;
    }
    &:hover {
        transform: translate(0, 0);
        -webkit-box-shadow: 0 0 10px 3px rgb(0 0 0 / 25%);
        -moz-box-shadow: 0 0 10px 3px rgb(0 0 0 / 25%);
        box-shadow: 0 0 10px 3px rgb(0 0 0 / 25%);
    }
    a.close-cookie-banner {
        position: absolute;
        top: calc( var(--padding) * 2 );
        right: calc( var(--padding) * 2 );
        display: inline-block;
        line-height: 1;
        text-align: center;
        vertical-align: middle;
        font-size: var(--h4);
        color: var(--white)!important;
        padding: 0;
        &:hover {
            color: var(--black)!important;
        }
    }
    p {
        &.cookie-icon {
            width: 50px;
            height: auto;
            display: block;
            margin: 0;
            text-align: left;
            font-size: var(--h1);
            line-height: calc( var(--h1) * 1.25 );
            @media only screen and (min-width: 768px) {
                width: 60px;
            }
            @media only screen and (min-width: 992px) {
                width: 80px;
            }
        }
    }
    .cookie-banner-content {
        width: calc( 100% - 50px);
        @media only screen and (min-width: 768px) {
            width: calc( 100% - 60px);
        }
        @media only screen and (min-width: 992px) {
            width: calc( 100% - 80px);
        }
        .consent-label {
        display: block;
        margin-bottom: var(--margin);
        p {
            &.cookie-desc {
                margin-top: 0;
                padding-right: 40px;
                a {
                    color: var(--white)!important;
                    text-decoration: underline;
                    &:hover {
                        color: var(--black)!important;
                    }
                }
            }
        }
        }
        p.consent-status {
        display: none;
        font-size: calc(var(--p) * 0.8);
        line-height: calc(var(--h3)*1.5);
        margin: 0 calc( var(--margin) * 0.5 );
        }
    }
    &.mini {
        position: absolute;
        padding: calc(var(--padding) * 0.5);
        transform: none;
        width: auto;
        cursor: pointer;
        .close-cookie-banner {
            display: none;
        }
        p {
        &.cookie-icon {
            width: auto;
            font-size: var(--h3);
            line-height: calc( var(--h3) * 1.5 );
        }
        }
        .cookie-banner-content {
            width: auto;
            .consent-label {
                display: none;
            }
            .consent-buttons {
                display: none;
            }
            p.consent-status {
                display: inline-block;
                color: var(--white);
                font-weight: 700;
                font-style: italic;
            }
        }
    }
}
</style>
