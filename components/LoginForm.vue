<script setup>
import Boxes from '@/mini/components/Boxes.vue'
import Box from '@/mini/components/Box.vue'
import Space from '@/mini/components/Space.vue'

const props = defineProps({
    username: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    submitLabel: {
        type: String,
        default: 'Sign in'
    },
    loadingLabel: {
        type: String,
        default: 'Signing in...'
    },
    idPrefix: {
        type: String,
        default: 'login'
    }
})

const emit = defineEmits(['update:username', 'update:password', 'submit'])

function onSubmit() {
    if (props.isLoading) return
    emit('submit')
}

function onUsernameInput(event) {
    emit('update:username', event.target.value)
}

function onPasswordInput(event) {
    emit('update:password', event.target.value)
}
</script>

<template>
    <form @submit.prevent="onSubmit" class="login-form">
        <Boxes gap="0">
            <Box size="100">
                <label class="S" :for="`${idPrefix}-username`">Username</label>
                <input
                    :id="`${idPrefix}-username`"
                    :value="props.username"
                    type="text"
                    required
                    autocomplete="username"
                    @input="onUsernameInput"
                />
            </Box>
            <Box size="100">
                <label class="S" :for="`${idPrefix}-password`">Password</label>
                <input
                    :id="`${idPrefix}-password`"
                    :value="props.password"
                    type="password"
                    required
                    autocomplete="current-password"
                    @input="onPasswordInput"
                />
            </Box>
            <Space />
            <Box size="100">
                <button type="submit" :disabled="props.isLoading">
                    {{ props.isLoading ? props.loadingLabel : props.submitLabel }}
                </button>
            </Box>
        </Boxes>

    </form>
</template>

<style scoped>
</style>