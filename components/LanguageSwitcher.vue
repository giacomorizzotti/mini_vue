<script setup>
import { useLocale } from '@/mini/composables/useLocale'

const { locale, setLocale, availableLocales } = useLocale()
</script>

<template>
  <nav id="lang-menu" class="menu lang-menu m-0">
    <ul class="menu lang-menu m-0">
      <li v-for="lang in availableLocales" :key="lang" class="item">
        <a
          href="#"
          class="lang-option"
          :class="locale === lang ? 'jpm-text active' : 'light-grey-text'"
          @click.prevent="setLocale(lang)"
          >{{ $t(`lang.${lang}`) }}</a>
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
