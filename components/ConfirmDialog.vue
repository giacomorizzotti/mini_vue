<template>
  <Modal :visible="isVisible" :z-index="1100" @close="cancel">
    <Boxes>
      <Box :size="100" v-if="currentTitle">
        <h3 class="m-0">{{ currentTitle }}</h3>
      </Box>
      <Box :size="100">
        <p>{{ currentMessage }}</p>
      </Box>
      <Box :size="100" class="right">
        <Button
          color="grey"
          @click="cancel"
        >
          {{ currentCancelText }}
        </Button>
        <Button
          color="main-color"
          @click="confirm"
        >
          {{ currentConfirmText }}
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

const currentMessage = ref(props.message)
const currentTitle = ref(props.title)
const currentConfirmText = ref(props.confirmText)
const currentCancelText = ref(props.cancelText)

// Options passed to show() override the static props for that one call.
const show = (options = {}) => {
  currentMessage.value = options.message ?? props.message
  currentTitle.value = options.title ?? props.title
  currentConfirmText.value = options.confirmText ?? props.confirmText
  currentCancelText.value = options.cancelText ?? props.cancelText
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
