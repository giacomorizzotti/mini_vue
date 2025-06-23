import { ref } from 'vue'

const messages = ref([])

export function useMessage() {

  function showMessage(msg, type='info', textColor="white", duration = 3000) {
    const id = Date.now() + Math.random()
    messages.value.push({ id, text: msg, type:type, textColor:textColor })
    setTimeout(() => {
      messages.value = messages.value.filter(m => m.id !== id)
    }, duration)
  }

  function showInfoMessage(msg) {
    showMessage(msg, type='info', textColor="white", duration = 3000);
  }

  function showWarningMessage(msg) {
    showMessage(msg, type='warning', textColor="white", duration = 3000);
  }

  function showSuccessMessage(msg) {
    showMessage(msg, type='success', textColor="white", duration = 3000);
  }

  function showDangerMessage(msg) {
    showMessage(msg, type='danger', textColor="white", duration = 3000);
  }

  function showBadMessage(msg) {
    showMessage(msg, type='bad', textColor="white", duration = 5000);
  }

  return { messages, showMessage, showInfoMessage, showWarningMessage, showSuccessMessage, showDangerMessage, showBadMessage }

}