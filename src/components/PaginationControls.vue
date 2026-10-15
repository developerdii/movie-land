<template>
  <nav v-if="pageCount > 1" class="pagination-switch mt-3" aria-label="Pagination">
    <button class="pagination-switch-btn" :disabled="!canPrev" @click="$emit('prev')" aria-label="Previous page">
      <i class="bi bi-chevron-left" aria-hidden="true"></i>
    </button>
    <span class="pagination-switch-count" aria-live="polite">{{ page + 1 }} <span>/</span> {{ pageCount }}</span>
    <button class="pagination-switch-btn" :disabled="!canNext" @click="$emit('next')" aria-label="Next page">
      <i class="bi bi-chevron-right" aria-hidden="true"></i>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  canPrev: { type: Boolean, default: false },
  canNext: { type: Boolean, default: false }
})

defineEmits(['prev', 'next'])
</script>
