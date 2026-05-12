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

  function showPersistentMessage(msg, type = 'info', textColor = 'white') {
    const id = Date.now() + Math.random()
    messages.value.push({ id, text: msg, type, textColor })
    return id
  }

  function updateMessage(id, newText) {
    const msg = messages.value.find(m => m.id === id)
    if (msg) msg.text = newText
  }

  function dismissMessage(id) {
    messages.value = messages.value.filter(m => m.id !== id)
  }

  function showInfoMessage(msg) {
    showMessage(msg, 'info');
  }

  function showWarningMessage(msg) {
    showMessage(msg, 'warning');
  }

  function showSuccessMessage(msg) {
    showMessage(msg, 'success');
  }

  function showDangerMessage(msg) {
    showMessage(msg, 'danger');
  }

  function showBadMessage(msg) {
    showMessage(msg, 'bad');
  }

  return { messages, showMessage, showPersistentMessage, updateMessage, dismissMessage, showInfoMessage, showWarningMessage, showSuccessMessage, showDangerMessage, showBadMessage }

}