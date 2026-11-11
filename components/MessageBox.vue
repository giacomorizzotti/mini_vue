<script setup>
import { computed } from 'vue'
import { useMessage } from '@/mini/composables/useMessage'
import Section from '@/mini/components/Section.vue';
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
const { messages, dismissMessage } = useMessage()
const hasMessages = computed(() => messages.value.length > 0)

// Screen readers only announce changes inside a live region that already
// existed, so these two are always rendered, outside the v-if below, and
// repeat the newest message: errors interrupt, everything else waits.
const latest = computed(() => messages.value[messages.value.length - 1] ?? null)
const isError = msg => msg?.type === 'danger' || msg?.type === 'error'
const politeText = computed(() => (latest.value && !isError(latest.value) ? latest.value.text : ''))
const alertText = computed(() => (isError(latest.value) ? latest.value.text : ''))

function clearAllMessages() {
  messages.value = []
}
</script>

<template>
  <div class="visually-hidden" role="status" aria-live="polite">{{ politeText }}</div>
  <div class="visually-hidden" role="alert" aria-live="assertive">{{ alertText }}</div>
  <Transition name="message-box-fade">
    <Section v-if="hasMessages" id="message-box" class="message-box">
      <Container fw @click.self="clearAllMessages">
        <Container>
          <div class="message-header">
            <button v-if="messages.length > 1" class="close-all-btn black-btn square round" @click="clearAllMessages" title="Close all messages" aria-label="Close all messages">✕</button>
          </div>
          <Boxes class="center flex-direction-column">
            <TransitionGroup name="message-item" tag="div" style="display:contents;">
              <Box v-for="msg in messages" :key="msg.id" class="message b-rad-10 box-shadow-dark" :background="msg.type">
                <div class="message-content">
                  <p :class="msg.textColor+'-text'">{{ msg.text }}</p>
                  <button :class="'close-btn m-0 py-0 ' + msg.type + '-btn'" @click="dismissMessage(msg.id)" title="Close this message" aria-label="Close this message">✕</button>
                </div>
              </Box>
            </TransitionGroup>
          </Boxes>
        </Container>
      </Container>
    </Section>
  </Transition>
</template>

<style scoped>
.message-box {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
  padding: calc(var(--padding) * 2);
  max-height: calc(100vh - (var(--menu-toggle-height) + var(--padding) * 2));
  width: 100vw;
  min-width: 100vw;
  @media (min-width: 768px) {
    width: 66.666666vw;
    min-width: 66.666666vw;
  }
}

.message-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--padding);
}

.message-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--padding);
}

.message-content p {
  margin: 0;
  flex: 1;
}

/* Whole box fade in/out */
.message-box-fade-enter-active,
.message-box-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.message-box-fade-enter-from,
.message-box-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Individual message slide in/out */
.message-item-enter-active,
.message-item-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.message-item-enter-from,
.message-item-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>