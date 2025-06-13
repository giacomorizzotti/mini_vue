<script setup>
import Box from '@/mini/components/Box.vue'

const props = defineProps({
	size: {
		type: [Number, String],
		default: 100
	},
})
</script>

<template>
  <Box :size="props.size" class="" style="height: 120px">
	<div class="loading-box b-rad-10"></div>
  </Box>
</template>

<style lang="scss" scoped>
.loading-box {
	display: block;
	background: linear-gradient(-45deg, var(--light-grey), var(--white));
	background-size: 400% 400%;
	animation: gradient 2s ease infinite;
	width: 100%;
	height: 100%;
}

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

</style>
