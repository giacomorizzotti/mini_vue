<script>
// Module-level key so every SubNavigation instance — regardless of nesting depth —
// shares the same injection symbol when looking up the nearest parent's registry.
const SUBNAV_CLOSE_REGISTRY = Symbol('subnav-close')
</script>

<script setup>
import { ref, onMounted, onUnmounted, watch, provide, inject } from 'vue'
import Container from '@/mini/components/Container.vue';
import Boxes from '@/mini/components/Boxes.vue';
import Box from '@/mini/components/Box.vue';
import { XmarkCircle } from '@iconoir/vue'
import { lockBodyScroll, unlockBodyScroll } from '@/mini/composables/useBodyScrollLock'
import { useOverlayA11y, closeLabel } from '@/mini/composables/useOverlayA11y'

const props = defineProps({
  visible: Boolean,
  // Nesting depth (1-3): each level renders narrower than the last, so an
  // outer panel stays visible behind an inner one. Only layer 1 draws the
  // dark backdrop — nested layers sit on top of the same one.
  layer: { type: Number, default: 1 },
  // Name of the close button for screen readers; defaults to "Close" in the
  // page's language.
  closeLabel: { type: String, default: '' },
})
const emit = defineEmits(['close', 'loaded'])

const rootEl = ref(null)
let lockedAncestor = null

const closeModal = () => emit('close')

// Esc, Tab and focus handling: see useOverlayA11y. With nested layers, Esc
// closes only the topmost one.
const panelRef = ref(null)
const { onGuardFocus } = useOverlayA11y(() => props.visible, () => panelRef.value?.$el ?? null, closeModal)

// While this panel is open, the panel it's nested inside (its nearest
// ancestor's own scrollable card) should sit scrolled to the top and not
// scroll any further — it's only ever partially visible behind this one,
// so letting it keep scrolling underneath would be disorienting. Walking
// up the DOM (rather than coordinating via props) keeps this generic for
// any nesting depth: each layer only ever has to lock the one behind it.
const lockAncestorScroll = () => {
  const ancestor = rootEl.value?.$el?.closest('.subnav-content-wrapper')
  if (!ancestor) return
  lockedAncestor = ancestor
  ancestor.scrollTop = 0
  ancestor.style.overflow = 'hidden'
}
const unlockAncestorScroll = () => {
  if (!lockedAncestor) return
  lockedAncestor.style.overflow = ''
  lockedAncestor = null
}

// Body scroll is a global resource — only the outermost layer (1) locks
// and unlocks it via the shared ref-counted lock. Nested layers lock only
// their direct ancestor's scroll.
watch(() => props.visible, (newVisible) => {
  if (props.layer === 1) {
    if (newVisible) lockBodyScroll()
    else unlockBodyScroll()
  }
  if (newVisible) lockAncestorScroll()
  else unlockAncestorScroll()
})

onMounted(() => {
  if (props.visible) {
    if (props.layer === 1) lockBodyScroll()
    lockAncestorScroll()
  }
  emit('loaded')
})

onUnmounted(() => {
  if (props.layer === 1 && props.visible) unlockBodyScroll()
  unlockAncestorScroll()
})

// --- Backdrop click: close only the innermost open layer ---
//
// Each SubNavigation provides a registry so its direct child can register its
// closeModal function. When the backdrop (layer 1's #black-layer) is clicked,
// handleBackdropClick calls the registered child's handler if one exists —
// closing only the innermost layer — or its own closeModal if none is registered.
// Children register/unregister themselves via the parent's injected registry
// whenever their visible prop changes.

const childCloseHandler = ref(null)
provide(SUBNAV_CLOSE_REGISTRY, {
  // Close any open sibling before accepting the new child — enforces
  // "at most one visible child" so the backdrop chain stays consistent.
  register: (fn) => { childCloseHandler.value?.(); childCloseHandler.value = fn },
  unregister: (fn) => { if (childCloseHandler.value === fn) childCloseHandler.value = null },
})

// Each layer registers its own handleBackdropClick (not closeModal) with the parent.
// This creates a delegation chain: backdrop click on layer 1 → layer 2's
// handleBackdropClick → layer 3's handleBackdropClick → layer 3 has no child →
// closes itself. Only the deepest open layer closes per click.
const handleBackdropClick = () => {
  if (childCloseHandler.value) childCloseHandler.value()
  else closeModal()
}

const parentRegistry = inject(SUBNAV_CLOSE_REGISTRY, null)

watch(() => props.visible, (visible) => {
  if (!parentRegistry) return
  if (visible) parentRegistry.register(handleBackdropClick)
  else parentRegistry.unregister(handleBackdropClick)
})

onMounted(() => {
  if (props.visible && parentRegistry) parentRegistry.register(handleBackdropClick)
})

onUnmounted(() => {
  if (parentRegistry) parentRegistry.unregister(handleBackdropClick)
})
</script>

<template>
    <Transition name="subnav-slide" appear>
        <Container ref="rootEl" v-show="visible" fw class="subnav-box full-page-container" :class="`subnav-layer-${layer}`">
            <div v-if="layer === 1" class="subnav-black-layer" @click="handleBackdropClick()"></div>
            <Boxes class="subnav-click-layer justify-content-start align-items-start z-3" fh>
                <Box ref="panelRef" background="white" class="pe-5 box-shadow subnav-content-wrapper contain"
                    role="dialog" aria-modal="true" tabindex="-1">
                    <span data-focus-guard tabindex="0" class="focus-guard" @focus="onGuardFocus('start')"></span>
                    <p class="m-0 right" style="position: absolute; right: calc( var(--margin) * 1.5 ); top: calc( var(--margin) * 1.5 );">
                        <a class="pointer black-text" role="button" tabindex="0" :aria-label="props.closeLabel || closeLabel()"
                            @click="emit('close')" @keydown.enter.prevent="emit('close')" @keydown.space.prevent="emit('close')">
                            <XmarkCircle width="32px" height="32px" class="m-0" aria-hidden="true" style="background-color: var(--white); border-radius: 50%; box-shadow: 0 0 5px 5px var(--white)"/>
                        </a>
                    </p>
                    <slot/>
                    <span data-focus-guard tabindex="0" class="focus-guard" @focus="onGuardFocus('end')"></span>
                </Box>
            </Boxes>
        </Container>
    </Transition>
</template>

<style lang="scss" scoped>
.subnav-box.full-page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}

.subnav-black-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.subnav-click-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  // This flex wrapper always spans the full viewport, even though a
  // narrower nested layer's visible card doesn't — without this, the
  // empty space beside a nested card would sit on top of whatever's
  // underneath (e.g. an outer layer's close button) and swallow clicks
  // meant for it. The card re-enables pointer events for itself below.
  pointer-events: none;
}

.subnav-content-wrapper {
  height: 100vh;
  width: 90vw;
  pointer-events: auto;
  overflow-y: auto;
  @media screen and (min-width: 768px) {
    width: 85vw;
  }
}

// Focus lands on the panel itself when it opens (useOverlayA11y), so screen
// readers announce it; it isn't a control, so no focus ring.
.subnav-content-wrapper:focus {
  outline: none;
}

.subnav-layer-2 .subnav-content-wrapper {
  width: 82.5vw;
  @media screen and (min-width: 768px) {
    width: 80vw;
  }
}

.subnav-layer-3 .subnav-content-wrapper {
  width: 75vw;
  @media screen and (min-width: 768px) {
    width: 75vw;
  }
}

// `pointer-events: none` on #click-to-hide-layer alone isn't enough: its
// own parent (.full-page-container) still covers the full viewport and
// still has the default `auto`, so it just catches the click itself
// instead of letting it fall through to whatever's underneath (an outer
// layer's close button). Disabling pointer events on the whole nested
// layer's container — not layer 1's, which still needs to swallow clicks
// on its own backdrop — lets the inherited `none` reach all the way down,
// with `.subnav-content-wrapper`'s `auto` opting the visible card back in.
.subnav-layer-2.full-page-container,
.subnav-layer-3.full-page-container {
  pointer-events: none;
}

.z-top {
  z-index: 10;
}

// Panel slides in/out left-to-right; backdrop just fades, since
// transitioning `display` itself (what v-show toggles) isn't animatable —
// Vue's <Transition> defers that flip until these classes finish.
.subnav-slide-enter-active .subnav-content-wrapper,
.subnav-slide-leave-active .subnav-content-wrapper {
  transition: transform 0.3s ease;
}
.subnav-slide-enter-from .subnav-content-wrapper,
.subnav-slide-leave-to .subnav-content-wrapper {
  transform: translateX(-100%);
}

.subnav-slide-enter-active .subnav-black-layer,
.subnav-slide-leave-active .subnav-black-layer {
  transition: opacity 0.3s ease;
}
.subnav-slide-enter-from .subnav-black-layer,
.subnav-slide-leave-to .subnav-black-layer {
  opacity: 0;
}

/* Invisible Tab stops at the panel's edges that send focus back around
   (useOverlayA11y's focus guards). Not 0x0: Chrome's Tab skips those.
   Fixed, so focusing one never scrolls the panel. */
.focus-guard {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  outline: none;
}
</style>
