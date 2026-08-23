<script setup>
import { InfoCircle } from '@iconoir/vue'
import Container from './Container.vue'
import Boxes from './Boxes.vue'
import Box from './Box.vue'
import { useInfoLayer } from '../composables/useInfoLayer'

// Wraps the "info layer" pattern repeated across a consuming app's pages: a
// dismissible tutorial box shown only while useInfoLayer()'s shared,
// localStorage-persisted switch is on, plus a one-line collapsed fallback
// once it's off (both states toggle the same switch back and forth).
// Purely UI chrome -- the actual tutorial content (default slot), the
// dismiss-hint sentence (#dismiss-hint slot), and the collapsed state's own
// label (#collapsed-label slot) are all supplied by the consumer, since
// they're translated text this component has no business assuming a
// vue-i18n key for (see this repo's own CLAUDE.md on not over-fitting to
// one consumer's setup -- no mini component calls $t() internally, by
// convention). A consumer's own #dismiss-hint slot content typically wants
// its own clickable toggle too (e.g. wrapping a "info layer" label in a
// button) -- it can call useInfoLayer() itself for that, same shared
// singleton ref this component reads, no prop needed to hand it down.
defineProps({
  boxSize: { type: String, default: '66' },
})

const infoLayerEnabled = useInfoLayer()
</script>

<template>
  <Container v-if="infoLayerEnabled">
    <Boxes class="pt-2 px-1">
      <Box :size="boxSize" class="fw-bg p-2 b-rad-10 border info-layer-border">
        <InfoCircle width="28px" height="28px" class="info-layer-text me-1 inline-block" style="vertical-align: top; box-sizing: border-box;"/>
        <div class="inline-block" style="width: calc(100% - 28px - var(--margin));">
          <slot />
          <p class="XS grey-text mt-1 mb-0">
            <slot name="dismiss-hint" />
          </p>
        </div>
      </Box>
    </Boxes>
  </Container>
  <Container v-else>
    <Boxes class="pt-2 px-1">
      <Box class="fw-bg p-05 b-rad-5 border info-layer-border">
        <p class="XS m-0 pointer" @click="infoLayerEnabled = !infoLayerEnabled">
          <InfoCircle width="14px" height="14px" class="info-layer-text me-05" style="vertical-align: top;"/>
          <u><slot name="collapsed-label" /></u>
        </p>
      </Box>
    </Boxes>
  </Container>
</template>
