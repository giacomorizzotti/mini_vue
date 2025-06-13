<script setup>
import { ref } from 'vue'
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';

const username = ref('')
const password = ref('')
import { useAuth } from '@/mini/composables/useAuth.js'
const { isAuthenticated, resourceOwnerPasswordBased } = useAuth('http://127.0.0.1:8000/o/token/', 'http://127.0.0.1:8000/o/introspect/')

function login() {
    resourceOwnerPasswordBased(username.value, password.value, 'c5j8a4MAe8C4BFbo3wFY2w8PhcXHXshMtp5Giees', 'V6ODlEGqeXQQfVV4zhPssAZ6q7RHNclSc2KJ0egHvQe1DiDju5iateb7etA0wBqI53JQLDuSCXv4gRwIrLGMmVvNq0Wgd6SSFYC7YPIVoDCFSGAmExl2YufVr8B9Bgd7')
}
</script>

<template>
<form @submit.prevent="login">
    <Boxes>
        <Box :size="100">
            <input v-model="username" placeholder="Username" required />
        </Box>
        <Box :size="100">
            <input v-model="password" type="password" placeholder="Password" required />
        </Box>
        <Box :size="100">
            <button type="submit" class="btn">Login</button>
        </Box>
    </Boxes>
</form>
</template>