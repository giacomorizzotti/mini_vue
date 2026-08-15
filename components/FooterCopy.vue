<script setup>
import { Telegram } from '@iconoir/vue';
import Space from './Space.vue';

  const props = defineProps({
    siteTitle: {
      type: [String],
      default: 'mini'
    },
    company: {type: [String]},
    companyUrl: {type: [String]},
    phone: {type: [String]},
    telegram: {type: [String]},
    email: {type: [String]},
    address: {type: [String]},
    addressTwo: {type: [String]},
    TaxNumber: {type: [String]},
    idCode: {type: [String]},
  })
  
  const currentYear = new Date().getFullYear()
  
</script>

<template>
  <p class="">{{ currentYear }}&nbsp;©&nbsp;<a v-if="props.companyUrl" :href="props.companyUrl" class="bold" target="_blank">{{ props.company }}</a><span v-else>{{ props.company }}</span></p>
  <p v-if="props.address" class="S mb-0">{{ props.address }}</p>
  <p v-if="props.addressTwo" class="S mt-0">{{ props.addressTwo }}</p>
  <Space v-if="props.email || props.telegram || props.phone"/>
  <p v-if="props.email" class="S m-0"><span class="label">email:</span> <b>{{ props.email }}</b></p>
  <p v-if="props.phone" class="S m-0"><span class="label">phone:</span> <b>{{ props.phone }}</b></p>
  <p v-if="props.telegram" class="S m-0"><a :href="'https://t.me/'+props.telegram"><Telegram width="16px" height="16px" style="vertical-align: text-bottom;" title="Telegram"  /> @{{ props.telegram }}</a></p>
  <Space v-if="props.TaxNumber || props.idCode"/>
  <p v-if="props.TaxNumber" class="S m-0"><span class="label">P.IVA:</span> <b>{{ props.TaxNumber }}</b></p>
  <p v-if="props.idCode" class="S m-0"><span class="label">C.F:</span> <b>{{ props.idCode }}</b></p>
</template>

<style lang="scss" scoped>
</style>
