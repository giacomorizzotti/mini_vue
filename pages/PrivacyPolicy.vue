<script setup>

import { ref, onMounted } from 'vue'
import { useMessage } from '@/mini/composables/useMessage'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import { OWNER } from '@/config/owner'

const { showMessage } = useMessage()
const privacyHtml = ref('')

onMounted(async () => {
  try {
    const url = new URL('https://api.uwa.agency/privacy-policy/')
    Object.entries(OWNER).forEach(([k, v]) => url.searchParams.set(k, v))
    url.searchParams.set('purposes', 'login,analytics')
    url.searchParams.set('hosting_region', 'eu')
    const response = await fetch(url)
    privacyHtml.value = await response.text()
  } catch (error) {
    showMessage('Errore nel caricamento della privacy policy.', 'danger')
  }
})

</script>

<template>
  <Container fw>
    <Container>
      <Boxes spaceTopBot>
        <Box :size="100">
          <h1>Privacy policy</h1>
        </Box>
        <Box :size="66" v-html="privacyHtml">
        </Box>
      </Boxes>
    </Container>
  </Container>
</template>

<style lang="scss" scoped>
</style>
