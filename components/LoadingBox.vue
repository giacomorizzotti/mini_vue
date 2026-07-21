<script setup>
import Box from '@/mini/components/Box.vue'

const props = defineProps({
	size: {
		type: [Number, String],
		default: 100
	},
	height: {
		type: [Number, String],
		default: 100
	},
})

const heightStyle = typeof props.height === 'number' ? `${props.height}px` : props.height
</script>

<template>
  <Box :size="props.size" padding="0" :style="{ height: heightStyle }" class="relative">
	<div class="loading-box b-rad-10"></div>
  </Box>
</template>

<style lang="scss" scoped>
.loading-box:before {
  content: '';
  position: absolute;
  top: -1rem;
  left: -1rem;
  display: block;
  width: calc(100% + 2rem);
  height: calc(100% + 2rem);
  z-index:0;
  border-radius: 10px;
  z-index:0;
  background: linear-gradient(45deg, var(--false-white) 25%, var(--main-color-transp) 50%, var(--false-white) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  filter: blur(10px);
}
.loading-box:after {
  content: '';
  top: 0;
  left: 0;
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  z-index:1;
  border-radius: 10px;
  background: white;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
