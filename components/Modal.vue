<script setup>
import { ref } from 'vue'
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { XmarkCircle } from '@iconoir/vue'
import { useModal } from '@/mini/composables/useModal.js';
const { modalClass, modalVisibilityToggle, modalVisibilityHide } = useModal()
</script>

<template>
    <Container id="modal-box" fw class="full-page-conatainer" :class="modalClass">
        <div id="black-layer"></div>
        <Boxes fh class="justify-content-center align-items-center z-3">
            <Box :size="50" padding="2" background="white" class="b-rad-10 box-shadow modal-content-wrapper" v-on:mouseleave="modalVisibilityHide">
                <Boxes>
                    <Box :size="100" padding="0" class="z-2">
                        <p class="m-0 right">
                        <a class="pointer black-text">
                            <XmarkCircle width="32px" height="32px" class="m-0" @click="modalVisibilityToggle"/>
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
    z-index: 3;
    transition: all 0.25s ease;
    position: absolute;
    min-height: 100vh;
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
