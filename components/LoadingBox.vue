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
</style>
