<script setup>
  const props = defineProps({
    logoUrl: {
      type: [String],
      default: 'https://mini.uwa.agency/img/brand/mini_emblem.svg'
    },
    siteTitle: {
      type: [String],
      default: 'mini'
    },
    company: {type: [String], default: "UWA.agency"},
    phone: {type: [String], default: "+345 329 7079"},
    email: {type: [String], default: "ciao@uwa.agency"},
    address: {type: [String], default: "Via Sant'Andrea Apostolo 32"},
    addressTwo: {type: [String], default: "28100, Novara [NO], Italy"},
    TaxNumber: {type: [String]},
    idCode: {type: [String]},
  })
</script>

<template>
  <footer id="footer">
    <slot/>
  </footer>
</template>

<style lang="scss" scoped>
</style>
