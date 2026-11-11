<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, useAttrs } from 'vue'
import { Xmark } from '@iconoir/vue'
import { useCombobox, removeLabel as defaultRemoveLabel } from '@/mini/composables/useCombobox'

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
  // Skips the removable chips below the input, for a caller that already
  // shows the selection somewhere else (selected options are still left out
  // of the dropdown either way).
  hideSelected: {
    type: Boolean,
    default: false,
  },
  // Accessible name of each chip's remove button, from the option's label.
  // Defaults to "Remove <label>" in the page's language.
  removeLabel: {
    type: Function,
    default: defaultRemoveLabel,
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

// The list's rows in order: the matches, then the "create" row if offered.
const CREATE_ROW = Symbol('create')
const listRows = computed(() => showCreateOption.value ? [...filteredOptions.value, CREATE_ROW] : filteredOptions.value)
const listShown = computed(() => isOpen.value && listRows.value.length > 0)
const { listboxId, optionId, activeIndex, move } = useCombobox(listRows, listShown)
// The list's own name: the aria-label the caller gave, else the placeholder.
const attrs = useAttrs()
const listLabel = computed(() => attrs['aria-label'] || props.placeholder)

function selectOption(option) {
  emit('update:modelValue', [...props.modelValue, option.id])
  query.value = ''
  // Closes the dropdown after a pick, matching createOption() below --
  // needs its own @click="isOpen = true" on the input (see template) to
  // stay a single click to reopen: the <li>'s @mousedown.prevent keeps the
  // input focused through a selection (so @blur doesn't fire mid-click and
  // break it), which means the input never actually loses focus here --
  // @focus alone wouldn't refire on a click that isn't a real focus
  // transition, so reopening would otherwise need a click away and back.
  isOpen.value = false
}

function removeOption(id) {
  emit('update:modelValue', props.modelValue.filter(existingId => existingId !== id))
}

// From the keyboard, the focused remove button disappears with its chip, so
// focus moves to the chip that takes its place, the one before it, or the
// input once no chips are left.
function removeOptionFromKeyboard(id, index) {
  removeOption(id)
  nextTick(() => {
    const buttons = rootEl.value?.querySelectorAll('.autocomplete-chip-remove') ?? []
    const next = buttons[Math.min(index, buttons.length - 1)] ?? rootEl.value?.querySelector('input')
    next?.focus()
  })
}

function createOption() {
  emit('create', trimmedQuery.value)
  query.value = ''
  isOpen.value = false
}

function handleKeydown(event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    // preventDefault keeps the caret where it is.
    event.preventDefault()
    isOpen.value = true
    move(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'Escape') {
    // With the list open, Esc only closes the list: a Modal around this
    // field skips an Esc that's already handled (defaultPrevented).
    if (listShown.value) event.preventDefault()
    isOpen.value = false
  } else if (event.key === 'Enter' && listShown.value && activeIndex.value >= 0) {
    // The highlighted row. Without one, Enter keeps its old behaviour below.
    event.preventDefault()
    const row = listRows.value[activeIndex.value]
    if (row === CREATE_ROW) createOption()
    else selectOption(row)
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
  // Selecting an option removes it from filteredOptions, which Vue can
  // patch out of the DOM before this same click event finishes bubbling up
  // to window (the browser runs a microtask checkpoint, flushing Vue's
  // reactivity queue, between each listener in a single event's dispatch)
  // -- by the time this runs, event.target may already be the now-detached
  // <li>, and a detached node's .contains() check against anything is
  // always false, misreading a perfectly-inside click as "outside" and
  // closing the dropdown right after every single selection.
  // event.composedPath() instead reflects the DOM tree structure at the
  // moment the event was dispatched, unaffected by that mid-dispatch
  // removal, so it still correctly reports the click as inside.
  const path = event.composedPath ? event.composedPath() : null
  const isInside = rootEl.value && (path ? path.includes(rootEl.value) : rootEl.value.contains(event.target))
  if (!isInside) {
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
      role="combobox"
      aria-autocomplete="list"
      :aria-label="attrs['aria-label']"
      :aria-expanded="listShown ? 'true' : 'false'"
      :aria-controls="listShown ? listboxId : undefined"
      :aria-activedescendant="listShown && activeIndex >= 0 ? optionId(activeIndex) : undefined"
      @input="isOpen = true"
      @focus="isOpen = true"
      @click="isOpen = true"
      @blur="isOpen = false"
      @keydown="handleKeydown"
    />
    <!-- tabindex="-1": the list scrolls, and Chrome makes scrollable boxes
         Tab stops on their own. Tab would land here, the input's blur would
         close the list, and focus would drop to the page. -->
    <ul v-if="listShown" :id="listboxId" class="autocomplete-options" tabindex="-1" role="listbox" :aria-label="listLabel">
      <li
        v-for="(option, index) in filteredOptions"
        :key="option.id"
        :id="optionId(index)"
        role="option"
        :aria-selected="index === activeIndex ? 'true' : 'false'"
        :class="{ 'is-active': index === activeIndex }"
        @mousedown.prevent
        @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
      <li
        v-if="showCreateOption"
        :id="optionId(filteredOptions.length)"
        role="option"
        :aria-selected="activeIndex === filteredOptions.length ? 'true' : 'false'"
        :class="{ 'is-active': activeIndex === filteredOptions.length }"
        @mousedown.prevent
        @click="createOption"
      >
        {{ createLabel(trimmedQuery) }}
      </li>
    </ul>
    <p v-if="!hideSelected && selectedOptions.length" class="my-1 flex g-05 align-items-start flex-wrap">
      <span v-for="(option, index) in selectedOptions" :key="option.id" class="link-box p-075 b-rad-5">
        {{ option.label }}
        <span
          role="button"
          tabindex="0"
          class="autocomplete-chip-remove ms-05"
          :aria-label="removeLabel(option.label)"
          @click="removeOption(option.id)"
          @keydown.enter.prevent="removeOptionFromKeyboard(option.id, index)"
          @keydown.space.prevent="removeOptionFromKeyboard(option.id, index)"
        ><Xmark width="14" height="14" aria-hidden="true"/></span>
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
  top: calc( 100% + var(--margin) / 2);
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--white);
  border: 1px solid var(--color);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.autocomplete-options li {
  padding: calc(var(--padding) * 0.5) var(--padding);
  cursor: pointer;
}

.autocomplete-options li:hover,
.autocomplete-options li.is-active {
  background: var(--main-color-transp);
}

// The keyboard highlight. The transparent outline shows up in forced-colors
// mode, where backgrounds are replaced.
.autocomplete-options li.is-active {
  outline: 2px solid transparent;
  outline-offset: -2px;
}

.autocomplete-chip-remove {
  display: inline-block;
  vertical-align: text-bottom;
  line-height: 0;
  cursor: pointer;
}
</style>
