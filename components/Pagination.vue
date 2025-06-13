<script setup>
import Box from '@/mini/components/Box.vue';
import Button from '@/mini/components/Button.vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages) {
    // Only emit if within valid range
    emit('update:currentPage', page)
  }
}

const emit = defineEmits(['update:currentPage'])

</script>

<template>
  <Box :size="100" class="pagination py-0" v-if="totalPages > 1">
    <Button
      size="S"
      class="m-0"
      :disabled="currentPage === 1"
      :invert="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      Previous
    </Button>
    <p class="S grey-text">{{ currentPage }} of {{ totalPages }}</p>
    <Button
      size="S"
      class="m-0"
      :invert="currentPage === totalPages"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </Button>
  </Box>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: var(--basic-gap);
}
</style>