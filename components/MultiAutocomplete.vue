<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Xmark } from '@iconoir/vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  // Pre-mapped by the caller to a flat { id, label } shape, since the
  // underlying objects vary (a tag, a user, ...) and this component
  // shouldn't need to know their field names.
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
  // When true, a query with no exact-label match offers a "create" row at
  // the end of the dropdown — the component never creates anything itself
  // (it doesn't know about the caller's API), it just emits `create` with
  // the trimmed query text for the caller to handle.
  allowCreate: {
    type: Boolean,
    default: false,
  },
  createLabel: {
    type: Function,
    default: (query) => `Create "${query}"`,
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

const query = ref('')
const isOpen = ref(false)
const rootEl = ref(null)

const selectedOptions = computed(() => props.modelValue.map(id => props.options.find(option => option.id === id)).filter(Boolean))

// Already-selected options are dropped from the dropdown — there's no
// use re-offering something that's shown as a chip below the input.
const filteredOptions = computed(() => {
  const search = query.value.trim().toLowerCase()
  const available = props.options.filter(option => !props.modelValue.includes(option.id))
  if (!search) return available
  return available.filter(option => option.label.toLowerCase().includes(search))
})

const trimmedQuery = computed(() => query.value.trim())

// Only offered when nothing already matches exactly (case-insensitive) —
// no point offering to create a duplicate of an option already selectable
// (or already selected/hidden from filteredOptions) below.
const showCreateOption = computed(() =>
  props.allowCreate && trimmedQuery.value.length > 0
  && !props.options.some(option => option.label.toLowerCase() === trimmedQuery.value.toLowerCase())
)

function selectOption(option) {
  emit('update:modelValue', [...props.modelValue, option.id])
  query.value = ''
}

function removeOption(id) {
  emit('update:modelValue', props.modelValue.filter(existingId => existingId !== id))
}

function createOption() {
  emit('create', trimmedQuery.value)
  query.value = ''
  isOpen.value = false
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    isOpen.value = false
  } else if (event.key === 'Enter' && isOpen.value) {
    if (filteredOptions.value.length) {
      event.preventDefault()
      selectOption(filteredOptions.value[0])
    } else if (showCreateOption.value) {
      event.preventDefault()
      createOption()
    }
  }
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
      @input="isOpen = true"
      @focus="isOpen = true"
      @blur="isOpen = false"
      @keydown="handleKeydown"
    />
    <ul v-if="isOpen && (filteredOptions.length || showCreateOption)" class="autocomplete-options">
      <li v-for="option in filteredOptions" :key="option.id" @mousedown.prevent @click="selectOption(option)">
        {{ option.label }}
      </li>
      <li v-if="showCreateOption" @mousedown.prevent @click="createOption">
        {{ createLabel(trimmedQuery) }}
      </li>
    </ul>
    <p v-if="selectedOptions.length" class="mt-1 mb-0">
      <span v-for="option in selectedOptions" :key="option.id" class="grey-box">
        {{ option.label }}
        <Xmark width="14" height="14" style="vertical-align: text-bottom; cursor: pointer;" class="ms-05" @click="removeOption(option.id)"/>
      </span>
    </p>
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
