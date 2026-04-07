<script setup>
import { computed } from 'vue'
import { useMessage } from '@/mini/composables/useMessage'
import Section from '@/mini/components/Section.vue';
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
const { messages } = useMessage()
const hasMessages = computed(() => messages.value.length > 0)
</script>

<template>
  <Transition name="message-box-fade">
    <Section v-if="hasMessages" id="message-box" class="message-box">
      <Container fw>
        <Container width="thin">
          <Boxes class="center flex-direction-column">
            <TransitionGroup name="message-item" tag="div" style="display:contents;">
              <Box v-for="msg in messages" :key="msg.id" class="message b-rad-10 box-shadow-dark" :background="msg.type">
                <p :class="msg.textColor+'-text'">{{ msg.text }}</p>
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
  z-index: 99;
  width: 100vw;
  padding-top: calc(var(--padding) * 2);
  padding-bottom: calc(var(--padding) * 2);
  background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
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