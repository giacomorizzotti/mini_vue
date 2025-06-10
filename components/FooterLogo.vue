<script setup>
  import { RouterLink, RouterView } from 'vue-router'
  const props = defineProps({
    logo: {
      type: [String],
      default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
    },
  })
</script>

<template>
  <router-link :to="{ name: 'home' }" class=""><img :src="logo" class="logo emblem" alt="logo"/></router-link>
</template>

<style lang="scss" scoped>
  img.logo {
    width: 66.666666%;
    height: auto;
    display: block;
    filter: grayscale(100%);
    opacity: 0.1;
    transition: all 0.3s ease;
    margin: 0 auto;
    &:hover {
      filter: grayscale(0);
      opacity:1;
    }
  }
</style>
