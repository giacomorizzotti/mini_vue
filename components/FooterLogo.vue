<script setup>
  import { RouterLink, RouterView } from 'vue-router'
  const props = defineProps({
    logo: {
      type: [String],
      default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
    },
    width: {
      type: [String],
      default: '100%'
    }
  })
</script>

<template>
  <router-link :to="{ name: 'home' }" class=""><img :src="logo" class="img logo m-auto" alt="logo" :style="{ maxWidth: width + '!important' }"/></router-link>
</template>

<style lang="scss" scoped>
</style>
