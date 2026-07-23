<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { XmarkCircle } from '@iconoir/vue'
import { lockBodyScroll, unlockBodyScroll } from '@/mini/composables/useBodyScrollLock'

const props = defineProps({
  visible: Boolean,
  zIndex: { type: Number, default: 1000 },
})
const emit = defineEmits(['close', 'loaded'])

const closeModal = () => emit('close')

const handleKeydown = (e) => {
  if (e.key === 'Escape') closeModal()
}
const handleLayerClick = (e) => {
  if (e.target.classList.contains('modal-click-layer')) closeModal()
}

watch(() => props.visible, (newVisible) => {
  if (newVisible) lockBodyScroll()
  else unlockBodyScroll()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (props.visible) lockBodyScroll()
  emit('loaded')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (props.visible) unlockBodyScroll()
})
</script>

<template>
    <Teleport to="body">
        <Container v-if="visible" fw class="modal-box full-page-container" :style="{ zIndex: zIndex }">
            <div class="modal-black-layer"></div>
            <Boxes class="modal-click-layer justify-content-center align-items-center z-top" fh @click="handleLayerClick">
                <Box :size="50" padding="2" background="white" class="b-rad-10 box-shadow modal-content-wrapper">
                    <p class="m-0 right" style="position: absolute; right: calc( var(--margin) * 1.5 ); top: calc( var(--margin) * 1.5 ); z-index:9;">
                        <a class="pointer black-text">
                            <XmarkCircle width="32px" height="32px" class="m-0" @click="emit('close');" style="background-color: var(--white); border-radius: 50%; box-shadow: 0 0 5px 5px var(--white)"/>
                        </a>
                    </p>
                    <slot/>
                </Box>
            </Boxes>
        </Container>
    </Teleport>
</template>

<style lang="scss" scoped>
.modal-box.full-page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-black-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.modal-click-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.modal-content-wrapper {
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.z-top {
  z-index: 10;
}
</style>

