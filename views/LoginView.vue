<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/mini/stores/auth'
import { useMessage } from '@/mini/composables/useMessage'
import Container from '@/mini/components/Container.vue'
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import LoginForm from '@/mini/components/LoginForm.vue'

const props = defineProps({
  redirectRouteName: {
    type: String,
    default: 'home'
  }
})

const username = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()
const { showDangerMessage } = useMessage()

async function submitLogin() {
  if (authStore.isLoading) return
  const ok = await authStore.loginWithPassword(username.value, password.value)
  if (!ok) {
    showDangerMessage(authStore.authError || 'Login failed')
    return
  }
  const query = router.currentRoute.value.query
  const redirect = typeof query.redirect === 'string' ? query.redirect : { name: props.redirectRouteName }
  router.replace(redirect)
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
          @submit="submitLogin"
        />
      </Box>
    </Boxes>
  </Container>
</template>
