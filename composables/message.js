import { ref } from 'vue'

const messages = ref([])

export function useMessage() {
  function showMessage(msg, type='info', duration = 5000) {
    const id = Date.now() + Math.random()
    messages.value.push({ id, text: msg, type:type })
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id)
    }, duration)
  }
  return { messages, showMessage }
}