<script>
// Module-level, like useCombobox's: unique ids without Vue 3.5's useId, so projects on an
// older Vue that import the barrel still build.
let nextId = 0
</script>

<script setup>
// A row of tabs over the content they switch, styled by mini's `.tab-bar` (_tabs.scss),
// following the WAI-ARIA tabs pattern: one Tab stop for the whole row (the chosen tab),
// Left/Right (wrapping), Home and End move between tabs and choose at once.
//
//   <Tabs v-model="view" :tabs="[{ value: 'cards', label: 'Cards' }, { value: 'tree', label: 'Tree' }]" label="View">
//     <template #default="{ active }">…the chosen tab's content…</template>
//   </Tabs>
//
// With a default slot, Tabs renders the panel too (role="tabpanel", named by its tab).
// Without one it's the row alone, for a page that lays the content out elsewhere.
// The `tab` slot replaces a tab's text (an icon, a count): `#tab="{ tab, active }"`.
// Class and other attributes go on the row, so `class="S"` sizes the tabs only.
import { computed, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // The chosen tab's value.
  modelValue: { type: [String, Number], default: null },
  // [{ value, label }]
  tabs: { type: Array, required: true },
  // Names the row for screen readers, e.g. "View" or "Sections".
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const baseId = `mini-tabs-${++nextId}`
const tabId = index => `${baseId}-tab-${index}`
const panelId = `${baseId}-panel`

const rowEl = ref(null)
const activeIndex = computed(() => props.tabs.findIndex(tab => tab.value === props.modelValue))
// The row's one Tab stop: the chosen tab, or the first while none is.
const focusIndex = computed(() => Math.max(activeIndex.value, 0))

function choose(index) {
  if (props.tabs[index].value !== props.modelValue) emit('update:modelValue', props.tabs[index].value)
}

function onKeydown(event) {
  const buttons = [...(rowEl.value?.querySelectorAll(':scope > [role="tab"]') || [])]
  const count = buttons.length
  const current = buttons.indexOf(event.target)
  if (!count || current < 0) return
  const next = {
    ArrowRight: (current + 1) % count,
    ArrowLeft: (current - 1 + count) % count,
    Home: 0,
    End: count - 1,
  }[event.key]
  if (next === undefined) return
  event.preventDefault()
  choose(next)
  buttons[next].focus()
}
</script>

<template>
  <div ref="rowEl" v-bind="$attrs" class="tab-bar" role="tablist" :aria-label="label || undefined"
       @keydown="onKeydown">
    <button v-for="(tab, index) in tabs" :key="tab.value" :id="tabId(index)" type="button" role="tab"
            :aria-selected="index === activeIndex ? 'true' : 'false'"
            :aria-controls="$slots.default ? panelId : undefined"
            :tabindex="index === focusIndex ? 0 : -1"
            @click="choose(index)">
      <slot name="tab" :tab="tab" :active="index === activeIndex">{{ tab.label }}</slot>
    </button>
  </div>
  <div v-if="$slots.default" :id="panelId" role="tabpanel"
       :aria-labelledby="activeIndex >= 0 ? tabId(activeIndex) : undefined">
    <slot :active="modelValue"/>
  </div>
</template>
