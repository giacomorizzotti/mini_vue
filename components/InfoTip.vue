<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { InfoCircle } from '@iconoir/vue'
import { useInfoLayer } from '../composables/useInfoLayer'

const infoLayerEnabled = useInfoLayer()

const props = defineProps({
  size: { type: String, default: '18px' },
  // Horizontal anchor of the popover (and its bubble-tail direction)
  // relative to the icon — 'center' fits most inline uses, 'left'/'right'
  // are there for when the icon sits near a viewport edge.
  align: { type: String, default: 'center' },
  maxWidth: { type: String, default: '280px' },
  ariaLabel: { type: String, default: 'More info' },
})

const open = ref(false)
const rootRef = ref(null)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function onClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) close()
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

// Only listens while actually open — an always-on document/window listener
// would run on every click/keypress everywhere for no reason otherwise.
watch(open, isOpen => {
  if (isOpen) {
    document.addEventListener('click', onClickOutside)
    window.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('click', onClickOutside)
    window.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  window.removeEventListener('keydown', onKeydown)
})

const bubbleClass = {
  left: 'color-bubble-s-top-left',
  center: 'color-bubble-s-top',
  right: 'color-bubble-s-top-right',
}
</script>

<template>
  <!-- Two nested spans on purpose: this outer one is where any class/style
  the caller passes lands (Vue's default attrs fallthrough targets the
  single template root) — e.g. `class="absolute top right"` to pin the whole
  widget in a corner of its parent. The inner one keeps `relative` for its
  own sake, so the popover always anchors to the icon regardless of how the
  caller positions the outer wrapper — passing `absolute` in from outside
  can no longer fight over the same element's `position`. -->
  <span v-if="infoLayerEnabled" class="info-tip-outer inline-block">
    <span ref="rootRef" class="info-tip relative inline-block">
      <button type="button" class="info-tip-trigger m-0 round" :aria-expanded="open" :aria-label="ariaLabel" @click="toggle">
        <InfoCircle :width="size" :height="size" class="grey-text" />
      </button>
      <div
        v-if="open"
        class="info-tip-panel false-white-bg border color-border box-shadow-darker b-rad-5 p-1"
        :class="[bubbleClass[align], `align-${align}`]"
        :style="{ maxWidth }"
      >
        <slot />
      </div>
    </span>
  </span>
</template>

<style scoped>
.info-tip-trigger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.info-tip-panel {
  position: absolute;
  top: calc(100% + var(--margin));
  z-index: 1000;
  min-width: 200px;
  text-align: left;
  white-space: normal;
  font-weight: normal;
}
.info-tip-panel.align-left {
  left: calc(var(--margin) * -1.25);
}
.info-tip-panel.align-center {
  left: 50%;
  transform: translateX(-50%);
}
.info-tip-panel.align-right {
  right: calc(var(--margin) * -1.25);
}
</style>
