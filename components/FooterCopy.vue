<script setup>
  const props = defineProps({
    siteTitle: {
      type: [String],
      default: 'mini'
    },
    company: {type: [String], default: "UWA.agency"},
    phone: {type: [String], default: "+39 345 329 7079"},
    email: {type: [String], default: "ciao@uwa.agency"},
    address: {type: [String], default: "Via Sant'Andrea Apostolo 32"},
    addressTwo: {type: [String], default: "28100, Novara [NO], Italy"},
    TaxNumber: {type: [String]},
    idCode: {type: [String]},
  })
  
  const currentYear = new Date().getFullYear()
  
</script>

<template>
  <p class="">{{ currentYear }}&nbsp;©&nbsp;<span class="bold">{{ props.company }}</span></p>
  <p v-if="props.address" class="S mb-0">{{ props.address }}</p>
  <p v-if="props.addressTwo" class="S mt-0">{{ props.addressTwo }}</p>
  <p v-if="props.email" class="S mb-0"><span class="label">email:</span> <b>{{ props.email }}</b></p>
  <p v-if="props.phone" class="S mt-0"><span class="label">phone:</span> <b>{{ props.phone }}</b></p>
  <p v-if="props.TaxNumber" class="S mb-0"><span class="label">P.IVA:</span> <b>{{ props.TaxNumber }}</b></p>
  <p v-if="props.idCode" class="S mt-0"><span class="label">C.F:</span> <b>{{ props.idCode }}</b></p>
</template>

<style lang="scss" scoped>
</style>
