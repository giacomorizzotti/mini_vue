<script setup>
import { computed } from 'vue'
import { NavArrowUp } from '@iconoir/vue';
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()
</script>

<template>
  <div id="top"></div>
  <a href="#top"><div class="top-link" :class="[ scrollClass ]"><p class=""><NavArrowUp color="var(--white)" /></p></div></a>
</template>

<style lang="scss" scoped>
</style>
