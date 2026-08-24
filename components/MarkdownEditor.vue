<script setup>
import { ref, computed, nextTick } from 'vue'
import { Bold, Italic, Link, List, NumberedListLeft, Quote, Code, TextSize } from '@iconoir/vue'
import Button from './Button.vue'
import MarkdownText from './MarkdownText.vue'

// Full Markdown editor: a toolbar-driven <textarea> plus a single Plain/
// MarkDown toggle button, replacing a plain <textarea> wherever a
// description/pin-body field is edited. See plans/MARKDOWN_EDITOR_DESIGN.md
// (jpm repo) for the full design writeup this implements.
//
// inheritAttrs: false + a manual v-bind="$attrs" on the <textarea> itself
// (not the wrapping <div>) -- every call site this replaces has its own
// `<label for="some-id">` pointing at what used to be a plain <textarea>;
// without this, Vue's default fallthrough would put that `id` (and
// anything else, e.g. `required`) on the wrapping div instead, silently
// breaking the label's click-to-focus behavior.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  // Forwarded straight onto the <textarea> -- matches every existing
  // plain-<textarea> call site this replaces (e.g. `style="min-height:
  // 160px"`), so swapping the tag doesn't also require rewriting each
  // call site's own sizing.
  minHeight: {
    type: String,
    default: '160px',
  },
})

const emit = defineEmits(['update:modelValue'])

// Single source of truth -- the <textarea> binds to this directly, and
// every toolbar action reads/writes through it too, so there's never a
// separate "local draft" that could drift from what the parent sees.
const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const activeTab = ref('plain')
const textareaRef = ref(null)

function toggleTab() {
  activeTab.value = activeTab.value === 'plain' ? 'markdown' : 'plain'
}

// Every toolbar action funnels through here: write the new full text, then
// (after the DOM has actually re-rendered with it -- selectionStart/End
// can't be set against content that isn't there yet) restore focus and
// select whatever range makes sense for that action, so typing can
// continue immediately instead of the cursor jumping to the end.
function setValueAndSelect(newValue, selStart, selEnd) {
  value.value = newValue
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return
    el.focus()
    el.setSelectionRange(selStart, selEnd)
  })
}

// Wrap-selection buttons (Bold/Italic/Inline code): wraps the current
// selection in `before`/`after`; with nothing selected, inserts an empty
// pair and places the cursor between them. Also handles the reverse --
// re-clicking the same button toggles the markers back off, whether the
// selection includes them (selected the whole "**bold**") or sits just
// inside them (selected only "bold", markers immediately outside it) --
// the common "undo what I just did" gesture, not just one-way wrapping.
function wrapSelection(before, after = before) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = value.value
  const selected = text.slice(start, end)

  if (selected.startsWith(before) && selected.endsWith(after) && selected.length >= before.length + after.length) {
    const inner = selected.slice(before.length, selected.length - after.length)
    setValueAndSelect(text.slice(0, start) + inner + text.slice(end), start, start + inner.length)
    return
  }
  const outerBefore = text.slice(Math.max(0, start - before.length), start)
  const outerAfter = text.slice(end, end + after.length)
  if (before && outerBefore === before && outerAfter === after) {
    const newValue = text.slice(0, start - before.length) + selected + text.slice(end + after.length)
    const newStart = start - before.length
    setValueAndSelect(newValue, newStart, newStart + selected.length)
    return
  }

  const newValue = text.slice(0, start) + before + selected + after + text.slice(end)
  const cursorStart = start + before.length
  setValueAndSelect(newValue, cursorStart, cursorStart + selected.length)
}

// Heading is its own case, not a plain prefixLines() marker like the other
// three below -- there are 4 distinguishable levels (see mini's own
// _markdown.scss), and a single fixed "## " button could only ever reach
// one of them. Clicking cycles the *current line* (never a multi-line
// selection -- a heading belongs to one line, unlike a list/quote block)
// through none -> H1 -> H2 -> H3 -> H4 -> none, detecting whatever level
// is already there rather than blindly stacking more #s on repeated
// clicks.
function cycleHeading() {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = value.value
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const nextBreak = text.indexOf('\n', start)
  const lineEnd = nextBreak === -1 ? text.length : nextBreak
  const line = text.slice(lineStart, lineEnd)

  const match = /^(#{1,4}) /.exec(line)
  const currentLevel = match ? match[1].length : 0
  const nextLevel = currentLevel >= 4 ? 0 : currentLevel + 1
  const rest = match ? line.slice(match[0].length) : line
  const newLine = nextLevel === 0 ? rest : '#'.repeat(nextLevel) + ' ' + rest

  const newValue = text.slice(0, lineStart) + newLine + text.slice(lineEnd)
  const delta = newLine.length - line.length
  setValueAndSelect(newValue, start + delta, end + delta)
}

// Line-prefix buttons (Bulleted list/Numbered list/Quote): prefixes
// every line touched by the current selection (or just the current line,
// with nothing selected) with `marker`. Always a flat marker per line
// (e.g. "1. " on every line, not incrementing) -- CommonMark renders an
// <ol> correctly regardless of the literal numbers in the source, so
// there's no need to track/renumber them here.
function prefixLines(marker) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = value.value
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const nextBreak = text.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? text.length : nextBreak
  const block = text.slice(lineStart, lineEnd)
  const prefixed = block.split('\n').map(line => marker + line).join('\n')
  const newValue = text.slice(0, lineStart) + prefixed + text.slice(lineEnd)
  const addedBeforeStart = marker.length
  const addedTotal = prefixed.length - block.length
  setValueAndSelect(newValue, start + addedBeforeStart, end + addedTotal)
}

// Its own case, not a wrap/prefix variant: inserts `[label](https://)`
// around the current selection (selection becomes the link label, or a
// placeholder "link text" with nothing selected) and selects the
// "https://" placeholder so typing immediately replaces it -- no
// window.prompt()/inline dialog needed just for this one button, matching
// this app's existing avoidance of native prompt()/confirm() elsewhere.
function insertLink() {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = value.value
  const label = text.slice(start, end) || 'link text'
  const urlPlaceholder = 'https://'
  const insertion = `[${label}](${urlPlaceholder})`
  const newValue = text.slice(0, start) + insertion + text.slice(end)
  const urlStart = start + 1 + label.length + 2
  setValueAndSelect(newValue, urlStart, urlStart + urlPlaceholder.length)
}

function onKeydown(event) {
  if (!(event.metaKey || event.ctrlKey)) return
  const key = event.key.toLowerCase()
  if (key === 'b') { event.preventDefault(); wrapSelection('**') }
  else if (key === 'i') { event.preventDefault(); wrapSelection('*') }
  else if (key === 'k') { event.preventDefault(); insertLink() }
}
</script>

<template>
  <div class="markdown-editor">
    <p class="bar m-0 mb-05 flex flex-wrap align-items-start justify-content-between gap-05">
      <span class="flex flex-wrap gap-05 align-items-start justify-content-start">
        <Button size="XS" color="" invert rounded class="m-0" title="Heading (click to cycle H1–H4)" @click="cycleHeading">
          <TextSize width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Bold (Ctrl/Cmd+B)" @click="wrapSelection('**')">
          <Bold width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Italic (Ctrl/Cmd+I)" @click="wrapSelection('*')">
          <Italic width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Link (Ctrl/Cmd+K)" @click="insertLink">
          <Link width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Bulleted list" @click="prefixLines('- ')">
          <List width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Numbered list" @click="prefixLines('1. ')">
          <NumberedListLeft width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Quote" @click="prefixLines('> ')">
          <Quote width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
        <Button size="XS" color="" invert rounded class="m-0" title="Inline code" @click="wrapSelection('`')">
          <Code width="14px" height="14px" style="vertical-align: middle;"/>
        </Button>
      </span>
      <span class="flex flex-wrap g-05 align-items-start justify-content-end">
        <Button size="XS" color="" rounded class="m-0" :title="activeTab === 'plain' ? 'Showing the plain text you typed -- click to preview it as Markdown' : 'Showing rendered Markdown -- click to see the plain text you typed'" @click="toggleTab">{{ activeTab === 'plain' ? 'Plain' : 'MarkDown' }}</Button>
      </span>
    </p>
    <textarea
      v-show="activeTab === 'plain'"
      ref="textareaRef"
      v-model="value"
      v-bind="$attrs"
      :placeholder="placeholder"
      :style="{ minHeight }"
      @keydown="onKeydown"
    ></textarea>
    <div v-show="activeTab === 'markdown'" class="markdown-editor-preview" :style="{ minHeight }">
      <MarkdownText v-if="value" :text="value"/>
      <p v-else class="grey-text m-0">Nothing to preview yet.</p>
    </div>
  </div>
</template>
