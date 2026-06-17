<script setup>
import { useAuthStore } from '@/mini/stores/auth'
import { OAUTH_AUTHORIZE_ENDPOINT } from '@/config/auth'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import Space from '@/mini/components/Space.vue'

defineProps({
  redirectRouteName: {
    type: String,
    default: 'home'
  }
})

const authStore = useAuthStore()

function login() {
    const redirectUri = `${window.location.origin}/callback`
    authStore.initiateLogin(OAUTH_AUTHORIZE_ENDPOINT, redirectUri)
}
</script>

<template>
  <Container>
    <Boxes spaceTopBot fh class="align-content-start">
      <Box size="100">
        <Space height="2"/>
        <h1 class="m-0">Sign in</h1>
      </Box>
      <Box size="33" v-if="!authStore.isAuthenticated">
        <button @click="login" class="btn">Sign in with UWA</button>
      </Box>
    </Boxes>
  </Container>
</template>
