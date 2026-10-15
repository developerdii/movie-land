<template>
  <nav v-if="pageCount > 1" class="d-flex justify-content-center align-items-center gap-3 mt-3" aria-label="Pagination">
    <button class="btn btn-outline-secondary btn-sm" :disabled="!canPrev" @click="$emit('prev')" aria-label="Previous page">
      <i class="bi bi-chevron-left"></i>
    </button>
    <span class="small text-muted">{{ page + 1 }} / {{ pageCount }}</span>
    <button class="btn btn-outline-secondary btn-sm" :disabled="!canNext" @click="$emit('next')" aria-label="Next page">
      <i class="bi bi-chevron-right"></i>
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
