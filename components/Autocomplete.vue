<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => window.addEventListener('click', handleClickOutside))
onUnmounted(() => window.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootEl" class="autocomplete">
    <input
      type="text"
      v-model="query"
      :placeholder="placeholder"
      autocomplete="off"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="handleBlur"
      @keydown="handleKeydown"
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
