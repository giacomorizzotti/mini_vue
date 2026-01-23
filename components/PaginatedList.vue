<template>
  <div class="paginated-list">
    <slot 
      :paginatedItems="paginatedItems"
      :currentPage="currentPage"
      :totalPages="totalPages"
    />
    
    <Pagination
      v-if="totalPages > 1"
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="onPageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['page-change'])

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.items.slice(start, end)
})

const onPageChange = (page) => {
  // Scroll to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
  emit('page-change', page)
}

// Reset to page 1 when items change
watch(() => props.items, () => {
  currentPage.value = 1
})
</script>

<style scoped>
</style>
