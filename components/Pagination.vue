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
  <div class="pagination flex align-items-center" v-if="totalPages > 1">
    <Button
      size="S"
      class="my-0 me-05"
      :disabled="currentPage === 1"
      :class="currentPage === 1 ? 'light-grey-btn' : ''"
      @click="goToPage(1)"
    >
      First
    </Button>
    <Button
      size="S"
      class="m-0"
      :disabled="currentPage === 1"
      :class="currentPage === 1 ? 'light-grey-btn' : ''"
      @click="goToPage(currentPage - 1)"
    >
      Previous
    </Button>
    <p class="my-0 m-1 S grey-text">{{ currentPage }} of {{ totalPages }}</p>
    <Button
      size="S"
      class="my-0 me-05"
      :disabled="currentPage === totalPages"
      :class="currentPage === totalPages ? 'light-grey-btn' : ''"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </Button>
    <Button
      size="S"
      class="m-0"
      :disabled="currentPage === totalPages"
      :class="currentPage === totalPages ? 'light-grey-btn' : ''"
      @click="goToPage(totalPages)"
    >
      Last
    </Button>
  </div>
</template>

<style scoped>
</style>