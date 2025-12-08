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
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}
const restoreBodyScroll = () => {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
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
    <Container v-show="visible" fw class="modal-box full-page-conatainer">
        <div id="black-layer"></div>
        <Boxes id="click-to-hide-layer" fh class="justify-content-center align-items-center z-3" @click="handleLayerClick">
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
.full-page-conatainer  {
    z-index: 99;
    transition: all 0.25s ease;
    position: fixed;
    min-height: 100vh;
    top: 0; 
    left: 0;
    right: 0;
    #black-layer {
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        right: 0;
        width: 100vw;
        min-height: 100vh;
        background: #141428;
        background: linear-gradient(180deg,rgba(20, 20, 40, 1) 0%, rgba(20, 20, 40, 0) 100%);
        transition: background 0.25s ease-out, height 0.25s ease-out, opacity 0.25s ease-out;
    }
    .modal-content-wrapper {
        transition: transform 0.25s ease-out;
        max-height: 80vh;
        overflow-y: auto;
    }
}
</style>
