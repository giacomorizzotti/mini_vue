<script setup>
</script>

<template>
  <div class="boxes">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.boxes {
  display: flex;
  flex-flow: row wrap;
  position: relative;
  --gap: calc(var(--basic-gap) * 1);
  --gap-y: calc(var(--gap) * 1);
  --gap-x: calc(var(--gap) * 1);
  gap: var(--gap-y) var(--gap-x);
}
</style>
