<script setup>
  import { ref, onMounted } from 'vue'
  const props = defineProps({
    logoUrl: {
      type: [String],
      default: null
    },
  })
  
const loaderClass = ref(['loader'])
onMounted(() => {
  loaderClass.value.push('done')
} )
</script>

<template>
  <div :class="loaderClass">
    <img v-if="logoUrl" :src="logoUrl" class="loader-logo"/>
  </div>
</template>

<style lang="scss" scoped>
</style>
