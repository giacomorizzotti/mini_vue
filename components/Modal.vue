<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { XmarkCircle } from '@iconoir/vue'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'loaded'])

const closeModal = () => {
  emit('close')
}
// Close modal on Esc key
const handleKeydown = (e) => {
  if (e.key === 'Escape') closeModal()
}
const handleLayerClick = (e) => {
  if (e.target.id === 'click-to-hide-layer') closeModal()
}

// Prevent body scroll when modal is open
const preventBodyScroll = () => {
  const scrollY = window.scrollY
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
}
const restoreBodyScroll = () => {
  const scrollY = document.body.style.top
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo(0, parseInt(scrollY || '0') * -1)
}
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    preventBodyScroll()
  } else {
    restoreBodyScroll()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  if (props.visible) {
    preventBodyScroll()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  restoreBodyScroll()
})

emit('loaded');

</script>

<template>
    <Container v-show="visible" fw class="modal-box full-page-container">
        <div id="black-layer"></div>
        <Boxes id="click-to-hide-layer" fh class="justify-content-center align-items-center z-top" @click="handleLayerClick">
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
</template>

<style lang="scss" scoped>
.modal-box.full-page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

#black-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

#click-to-hide-layer {
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

