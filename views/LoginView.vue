<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/mini/stores/auth'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import LoginForm from '@/mini/components/LoginForm.vue'

const username = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

async function submitLogin() {
  if (authStore.isLoading) return
  const ok = await authStore.loginWithPassword(username.value, password.value)
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  }
}
</script>

<template>
  <Container>
    <Boxes spaceTopBot fh class="align-content-start">
      <Box size="100">
        <h1 class="m-0">Sign in</h1>
      </Box>

      <Box size="33">
        <LoginForm
          v-model:username="username"
          v-model:password="password"
          :is-loading="authStore.isLoading"
          :error="authStore.authError"
          @submit="submitLogin"
        />
      </Box>
    </Boxes>
  </Container>
</template>
