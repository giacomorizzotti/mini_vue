<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import MenuToggle from '@/mini/components/MenuToggle.vue';
import PageMenu from '@/mini/components/PageMenu.vue';
import { useMenuState } from '@/mini/composables/useMenuState'
const { menuStateClass } = useMenuState()
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()

const props = defineProps({
  menuToggle: {
    type: [Boolean],
    default: true
  },
  invert: {
    type: [Boolean],
    default: null
  }
})

const headerMenuClasses = computed(() => {
  const classes = [ 'p-0', scrollClass.value, menuStateClass.value ]
  if (props.invert === true) classes.push("invert")
  if (props.invert === 'top') classes.push("invert-top")
  if (props.invert === 'scroll' || props.invert === 'scrolled') classes.push("invert-scrolled")
  return classes
})


// Whether any `section.page-menu` element exists on the current page, so
// the nav box only renders when PageMenu would actually have something to show.
// Must be a ref updated after mount (and after each route change), not a
// computed: computed() only re-evaluates when a *reactive* dependency
// changes, and document.querySelectorAll isn't one — read synchronously
// during this component's own initial render (which happens before Vue has
// patched the page component's sections into the real DOM), it would cache
// `false` forever and the nav would never appear, no matter how many
// page-menu sections got added later.
const headerMenuPresence = ref(false)
const route = useRoute()

function updateHeaderMenuPresence() {
  // Same one-tick defer as PageMenu.vue's own updateMenuItems/observeSections
  // — gives the page component's sections a moment to actually land in the DOM.
  setTimeout(() => {
    headerMenuPresence.value = document.querySelectorAll('section.page-menu').length > 0
  }, 0)
}

onMounted(updateHeaderMenuPresence)
watch(() => route.fullPath, updateHeaderMenuPresence)

</script>

<template>
  <Box id="head-menus" :class="headerMenuClasses">
    <Boxes class="g-0 align-items-center">
      <Box v-if="headerMenuPresence" id="header-menu-box" class="p-0">
        <PageMenu id="page-menu" :invert="props.invert"/>
      </Box>
      <!-- A named slot, not a direct <LanguageSwitcher/> + boolean prop --
           the first version of this did that and broke every OTHER
           HeaderMenu consumer's build (brff has no vue-i18n installed at
           all): a static top-level import here is unconditional at build
           time regardless of what a runtime v-if later decides, so it
           pulled useLocale.js -> vue-i18n into every consumer's module
           graph whether or not they ever pass the prop. A slot has zero
           import here at all -- only a consumer that actually fills it
           (jpm/website's App.vue: <template #language-switcher>
           <LanguageSwitcher/></template>) takes on that dependency. -->
      <Box v-if="$slots['language-switcher']" class="p-0">
        <slot name="language-switcher"/>
      </Box>
      <Box v-if="menuToggle">
        <MenuToggle/>
      </Box>
    </Boxes>
  </Box>
</template>

<style lang="scss" scoped>
</style>
