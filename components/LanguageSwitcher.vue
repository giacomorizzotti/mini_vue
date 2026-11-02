<script setup>
import { computed } from 'vue'
import { useLocale } from '@/mini/composables/useLocale'

/** What each option does depends on what `linkFor(lang)` returns:
 *
 * - nothing (or no `linkFor` at all): stays on the page and calls setLocale.
 *   For a site whose URLs don't carry the language.
 * - an object, a vue-router location: a RouterLink. For a site whose URLs do
 *   (see localeRoute in useLocale.js). The site's own router must set the
 *   locale after each navigation; a click here doesn't, since ctrl+click opens
 *   a new tab and must leave this tab's language alone.
 * - a string, a plain URL: an <a href>, so a full page load. For one domain
 *   per language, or a site without vue-router.
 *
 * RouterLink is resolved by name at render time, not imported: a static
 * vue-router import would break the build of a project without vue-router
 * whether or not it ever returns a route -- same trap as the
 * language-switcher slot in HeaderMenu.vue.
 *
 * The look is mini's nav#lang-menu (css/scss/_nav.scss); a project restyles it
 * by overriding those selectors in its own stylesheet. Other attributes
 * (aria-label...) land on the <nav>. The default slot replaces a label, for
 * short codes or flags. */
const props = defineProps({
  linkFor: { type: Function, default: null },
})

// A click on another language, whichever way it switches (e.g. for analytics).
const emit = defineEmits(['switch'])

const { locale, setLocale, availableLocales } = useLocale()

const options = computed(() => availableLocales.map((lang) => {
  const target = props.linkFor?.(lang) || null
  // Only the keys each element needs, not undefined ones: a fallthrough
  // `href: undefined` would overwrite the href RouterLink renders itself.
  let attrs = { href: '#' }
  if (typeof target === 'string') attrs = { href: target, hreflang: lang }
  else if (target) attrs = { to: target, hreflang: lang }
  return { lang, active: lang === locale.value, inPlace: target === null, attrs }
}))

function onClick(option, event) {
  if (!option.active) emit('switch', option.lang)
  if (!option.inPlace) return
  event.preventDefault()
  setLocale(option.lang)
}
</script>

<template>
  <nav id="lang-menu" class="menu lang-menu m-0">
    <ul class="menu lang-menu m-0">
      <li v-for="option in options" :key="option.lang" class="item">
        <component
          :is="option.attrs.to ? 'RouterLink' : 'a'"
          v-bind="option.attrs"
          :lang="option.lang"
          :aria-current="option.active ? 'true' : undefined"
          class="lang-option"
          :class="{ active: option.active }"
          @click="onClick(option, $event)"
          ><slot :lang="option.lang" :active="option.active">{{ $t(`lang.${option.lang}`) }}</slot></component>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.lang-option {
  text-decoration: none;
  cursor: pointer;
}
</style>
