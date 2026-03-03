<script setup>
import { ref, computed, inject } from 'vue'
import { RouterLink, routerKey } from 'vue-router'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  logo: {
    type: [null, Boolean, String],
    default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
  },
  title: {
    type: [String],
    default: ''
  },
  menuToggle: {
    type: [Boolean],
    default: true
  },
  invert: {
    type: [Boolean, String],
    default: null
  },
  logoFrame: {
    type: [Boolean],
    default: false
  },
})

const DEFAULT_LOGO = 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
const router = inject(routerKey, null)

function resolveWithBaseUrl(path) {
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/')
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}${normalizedPath}`
}

const resolvedLogo = computed(() => {
  if (props.logo === false) return false

  const rawLogo = typeof props.logo === 'string' ? props.logo.trim() : ''
  const logoToUse = rawLogo || DEFAULT_LOGO

  if (/^(https?:)?\/\//.test(logoToUse) || logoToUse.startsWith('data:') || logoToUse.startsWith('blob:')) {
    return logoToUse
  }

  return resolveWithBaseUrl(logoToUse)
})

const resolvedTitle = computed(() => {
  const rawTitle = typeof props.title === 'string' ? props.title.trim() : ''
  if (rawTitle) return props.title
  if (typeof document !== 'undefined' && typeof document.title === 'string' && document.title.trim()) {
    return document.title
  }
  return ''
})

const brandLinkComponent = computed(() => (router ? RouterLink : 'a'))
const brandLinkProps = computed(() => (router ? { to: { name: 'home' } } : { href: resolveWithBaseUrl('/') }))

const headerBrandClasses = computed(() => {
  const classes = [ 'p-0', scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})
const headerBrandLogoBoxClasses = computed(() => {
  const classes = [ 'logo-box' ]
  if (props.logoFrame === true) classes.push("white-bg")
  return classes
})

</script>

<template>
  <Box id="brand" :class="headerBrandClasses">
    <Boxes class="g-0 align-items-center">
      <Box :class="headerBrandLogoBoxClasses" v-if="props.logo && props.logo !== false">
        <component :is="brandLinkComponent" v-bind="brandLinkProps" class="">
            <img :src="resolvedLogo" class="header-logo" alt="logo"/>
        </component>
      </Box>
      <Box class="title-box" v-if="resolvedTitle">
        <component :is="brandLinkComponent" v-bind="brandLinkProps" class="">
          <h3 class="site-title" v-html="resolvedTitle"/>
        </component>
      </Box>
    </Boxes>
  </Box>
</template>

<style lang="scss" scoped>
</style>
