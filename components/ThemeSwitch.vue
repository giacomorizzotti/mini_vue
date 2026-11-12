<script setup>
// Light / Dark / System buttons for mini's dark mode, through useTheme
// (the chosen one is pressed). Real buttons, so each is a Tab stop.
//
//   <ThemeSwitch/>
//   <ThemeSwitch size="S" label="Tema" :labels="{ light: 'Chiaro', dark: 'Scuro', system: 'Sistema' }"/>
import { useTheme } from '../composables/useTheme'

defineProps({
  // Names the group for screen readers.
  label: { type: String, default: 'Theme' },
  labels: { type: Object, default: () => ({ light: 'Light', dark: 'Dark', system: 'System' }) },
  // A mini size class for the buttons: XXS, XS, S, L, ...
  size: { type: String, default: 'XS' },
})

const { theme, themes } = useTheme()
</script>

<template>
  <div class="theme-switch" role="group" :aria-label="label">
    <button v-for="option in themes" :key="option" type="button"
            class="round m-0" :class="[size, theme === option ? 'btn' : 'btn-invert']"
            :aria-pressed="theme === option ? 'true' : 'false'"
            @click="theme = option">
      {{ labels[option] ?? option }}
    </button>
  </div>
</template>

<style scoped>
.theme-switch {
  display: inline-flex;
  flex-wrap: wrap;
  gap: calc(var(--margin) * 0.25);
}
</style>
