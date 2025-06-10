<script setup>
import { useMessage } from '@/mini/composables/message'
import Section from '@/mini/components/Section.vue';
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
const { messages } = useMessage()
</script>

<template>
  <Section id="message-box">
    <Container fw>
      <Container>
        <Boxes class="justify-content-center">
          <Box :size="66" v-for="msg in messages" :key="msg.id" class="message b-rad-10 box-shadow-dark" :background="msg.type">
            <p>{{ msg.text }}</p>
          </Box>
        </Boxes>
      </Container>
    </Container>
  </Section>
</template>

<style scoped>
#message-box {
  position: fixed;
  bottom: calc(var(--margin) * 3);
  z-index: 199;
}
</style>