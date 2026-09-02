<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Xmark } from '@iconoir/vue'

// Same pattern as MarkdownEditor.vue's own inner <textarea>: fallthrough
// attrs (class, id, disabled, ...) forward onto the actual <input> rather
// than the wrapping .autocomplete div, so a caller's own utility classes or
// a <label for="..."> still land where they'd expect on a plain <input>.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  // Pre-mapped by the caller to a flat { id, label } shape, since the
  // underlying objects vary (a user, a status, ...) and this component
  // shouldn't need to know their field names.
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
})

const emit = defineEmits(['update:modelValue'])

const query = ref('')
const isOpen = ref(false)
const rootEl = ref(null)

const selectedOption = computed(() => props.options.find(option => option.id === props.modelValue) ?? null)

// Keep the input text in sync whenever the selection changes from outside
// (e.g. the form resetting modelValue to null), not just from typing.
watch(selectedOption, (option) => {
  query.value = option ? option.label : ''
}, { immediate: true })

const filteredOptions = computed(() => {
  const search = query.value.trim().toLowerCase()
  if (!search) return props.options
  return props.options.filter(option => option.label.toLowerCase().includes(search))
})

function selectOption(option) {
  emit('update:modelValue', option.id)
  query.value = option.label
  // Needs the input's own @click="isOpen = true" (see template) to stay a
  // single click to reopen afterward -- @mousedown.prevent on each <li>
  // keeps the input focused through a selection, so it never actually
  // loses focus here, and @focus alone doesn't refire on a click that
  // isn't a real focus transition. Same fix as MultiAutocomplete.vue's.
  isOpen.value = false
}

function handleInput() {
  isOpen.value = true
  // Typing over a previously selected label without picking a new option
  // would otherwise leave the old id silently selected behind edited text.
  if (selectedOption.value && query.value !== selectedOption.value.label) {
    emit('update:modelValue', null)
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  } else if (event.key === 'Enter' && isOpen.value && filteredOptions.value.length) {
    event.preventDefault()
    selectOption(filteredOptions.value[0])
  }
}

function handleBlur() {
  // @mousedown.prevent on each <li> keeps focus on the input when the user
  // clicks a dropdown option, so blur only fires when focus truly leaves the
  // component (tab, click Save, click elsewhere). At that point either
  // auto-select an exact match or clear unconfirmed text so the field
  // accurately reflects whether an option is actually selected.
  if (!selectedOption.value) {
    const exactMatch = props.options.find(
      o => o.label.toLowerCase() === query.value.trim().toLowerCase()
    )
    if (exactMatch) {
      emit('update:modelValue', exactMatch.id)
      query.value = exactMatch.label
    } else {
      query.value = ''
    }
  }
  isOpen.value = false
}

function handleClickOutside(event) {
  // event.composedPath(), not .contains(event.target) -- see
  // MultiAutocomplete.vue's matching handleClickOutside for why: a DOM
  // mutation between two listeners of the same bubbling click event can
  // leave event.target detached, and a detached node's .contains() check
  // is always false. Currently harmless here (selectOption already forces
  // isOpen closed regardless), but it's the identical latent bug, fixed
  // the same way for when that assumption changes.
  const path = event.composedPath ? event.composedPath() : null
  const isInside = rootEl.value && (path ? path.includes(rootEl.value) : rootEl.value.contains(event.target))
  if (!isInside) {
    isOpen.value = false
  }
}

// @mousedown.prevent (see each <li> above) keeps focus on the input so this
// doesn't trigger handleBlur's exact-match fallback before the clear takes
// effect.
function clearSelection() {
  emit('update:modelValue', null)
  query.value = ''
  isOpen.value = false
}

onMounted(() => window.addEventListener('click', handleClickOutside))
onUnmounted(() => window.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootEl" class="autocomplete flex-grow">
    <input
      type="text"
      v-model="query"
      v-bind="$attrs"
      :class="{ 'has-clear': query }"
      :placeholder="placeholder"
      autocomplete="off"
      @input="handleInput"
      @focus="isOpen = true"
      @click="isOpen = true"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <Xmark
      v-if="query"
      width="14"
      height="14"
      class="autocomplete-clear"
      title="Clear"
      @mousedown.prevent
      @click="clearSelection"
    />
    <ul v-if="isOpen && filteredOptions.length" class="autocomplete-options">
      <li v-for="option in filteredOptions" :key="option.id" @mousedown.prevent @click="selectOption(option)">
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.autocomplete {
  position: relative;
}

.autocomplete input.has-clear {
  padding-right: calc(var(--padding) * 2.25);
}

.autocomplete-clear {
  position: absolute;
  top: 50%;
  right: var(--padding);
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--grey);
  &:hover {
    color: var(--color);
  }
}

.autocomplete-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--white);
  border: 1px solid var(--light-grey);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.autocomplete-options li {
  padding: calc(var(--padding) * 0.5) var(--padding);
  cursor: pointer;
}

.autocomplete-options li:hover {
  background: var(--light-grey);
}
</style>
