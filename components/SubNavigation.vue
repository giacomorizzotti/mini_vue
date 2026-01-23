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

// Close subnav on Esc key
const handleKeydown = (e) => {
  if (e.key === 'Escape') closeModal()
}
const handleLayerClick = (e) => {
  if (e.target.id === 'click-to-hide-layer') closeModal()
}

// Prevent body scroll when subnav is open
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
    <Container v-show="visible" fw class="subnav-box full-page-container">
        <div id="black-layer"></div>
        <Boxes id="click-to-hide-layer" fh class="justify-content-end align-items-end z-3" @click="handleLayerClick">
            <Box padding="2" background="white" class="box-shadow subnav-content-wrapper">
                <p class="m-0 right" style="position: absolute; right: calc( var(--margin) * 1.5 ); top: calc( var(--margin) * 1.5 );">
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
</style>
