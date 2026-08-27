<script setup>
import Button from '@/mini/components/Button.vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: 'S'
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
  <div class="pagination flex flex-wrap align-items-center" v-if="totalPages > 1">
    <Button
      :size="size"
      class="my-0 me-05"
      invert
      :disabled="currentPage === 1"
      :class="currentPage === 1 ? 'light-grey-btn' : ''"
      @click="goToPage(1)"
    >
      First
    </Button>
    <Button
      :size="size"
      class="m-0"
      invert
      :disabled="currentPage === 1"
      :class="currentPage === 1 ? 'light-grey-btn' : ''"
      @click="goToPage(currentPage - 1)"
    >
      Previous
    </Button>
    <p class="my-0 m-1 S grey-text">{{ currentPage }} / {{ totalPages }}</p>
    <Button
      :size="size"
      class="my-0 me-05"
      invert
      :disabled="currentPage === totalPages"
      :class="currentPage === totalPages ? 'light-grey-btn' : ''"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </Button>
    <Button
      :size="size"
      class="m-0"
      invert
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