<template>
  <Modal :visible="isVisible" @close="cancel">
    <Boxes>
      <Box :size="100" v-if="title">
        <h3 class="m-0">{{ title }}</h3>
      </Box>
      <Box :size="100">
        <p>{{ message }}</p>
      </Box>
      <Box :size="100" class="right">
        <Button 
          color="grey"
          @click="cancel"
        >
          {{ cancelText }}
        </Button>
        <Button 
          color="main-color"
          @click="confirm"
        >
          {{ confirmText }}
        </Button>
      </Box>
    </Boxes>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import Boxes from './Boxes.vue'
import Box from './Box.vue'
import Button from './Button.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: 'Are you sure?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const isVisible = ref(false)
const resolvePromise = ref(null)

const show = () => {
  isVisible.value = true
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const confirm = () => {
  isVisible.value = false
  if (resolvePromise.value) {
    resolvePromise.value(true)
  }
  emit('confirm')
}

const cancel = () => {
  isVisible.value = false
  if (resolvePromise.value) {
    resolvePromise.value(false)
  }
  emit('cancel')
}

defineExpose({
  show,
  confirm,
  cancel
})
</script>

<style scoped>
</style>
