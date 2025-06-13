<script setup>
import { computed } from 'vue'
import { NavArrowUp } from '@iconoir/vue';
import { useScrollState } from '@/mini/composables/useScrollState'
const { scrollClass } = useScrollState()
</script>

<template>
  <div id="top"></div>
  <a href="#top"><div class="top-link" :class="[ scrollClass ]"><p class=""><NavArrowUp color="var(--white)" /></p></div></a>
</template>

<style lang="scss" scoped>
// link to top
.top-link {
  width: calc( var(--baseline) * 4 );
  height: calc( var(--baseline) * 4 );
  background: var(--main-color);
  position: fixed!important;
  bottom: var(--padding);
  right: var(--padding);
  transition: all 0.3s ease;
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  border-radius: 50%;
  z-index: 100;
  border: 2px solid var(--white);
  display: flex;
  align-items: center;
  align-content: center;  
  &:hover {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }
  p {
    font-weight:700;
    text-align: center;
    color: var(--white);
    margin: 0;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
    width: 100%;
  }
  &.top {
    opacity: 0;
    visibility: hidden;
  }

  &.scrolled {
    opacity: 1;
    visibility: visible;
  }
}

</style>
