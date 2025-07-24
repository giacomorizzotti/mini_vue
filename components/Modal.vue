<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { XmarkCircle } from '@iconoir/vue'
import { useModal } from '@/mini/composables/useModal.js';

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'loaded'])

const closeModal = () => {
  emit('close')
}

// Close modal on Esc key
const handleKeydown = (e) => {
  if (e.key === 'Escape') closeModal()
}
// Close modal when clicking on the black layer
const handleLayerClick = (e) => {
  if (e.target.id === 'click-to-hide-layer') closeModal()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

emit('loaded');

</script>

<template>
    <Container v-show="visible" id="modal-box" fw class="full-page-conatainer">
        <div id="black-layer"></div>
        <Boxes id="click-to-hide-layer" fh class="justify-content-center align-items-center z-3" @click="handleLayerClick">
            <Box :size="50" padding="2" background="white" class="b-rad-10 box-shadow modal-content-wrapper">
                <Boxes>
                    <Box :size="100" padding="0" class="z-2">
                        <p class="m-0 right">
                        <a class="pointer black-text">
                            <XmarkCircle width="32px" height="32px" class="m-0" @click="emit('close');"/>
                        </a>
                        </p>
                    </Box>
                </Boxes>
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
    &.hidden {
        width: 100vw!important;
        opacity: 0!important;
        .modal-content-wrapper {
            transform: translate(0, -200%);
        }
    }
    &.shown {
        width: 100%;
        .modal-content-wrapper {

        }
    }
}
</style>
