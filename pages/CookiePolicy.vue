<script setup>

import { ref, onMounted } from 'vue'
import { useMessage } from '@/mini/composables/message'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
const { showMessage } = useMessage()

const privacyHtml = ref('')

onMounted(async () => {
  try {
    const response = await fetch('https://api.uwa.agency/cookie-policy/?owner=uwa')
    console.log(response)
    privacyHtml.value = await response.text()
  } catch (error) {
    showMessage('Errore nel caricamento della cookie policy.', 'danger')
  }
})

</script>

<template>
  <Container fw>
    <Container>
      <Boxes spaceTopBot>
        <Box :size="100">
          <h1>Cookie policy</h1>
        </Box>
        <Box :size="66" v-html="privacyHtml">
        </Box>
      </Boxes>
    </Container>
  </Container>
</template>

<style lang="scss" scoped>
</style>
