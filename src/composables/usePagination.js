import { computed, ref } from 'vue'

// Paginates a reactive list. `items` must be a ref (or computed).
export function usePagination(items, pageSize = 12) {
  const page = ref(0)

  const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))

  const pageItems = computed(() =>
    items.value.slice(page.value * pageSize, (page.value + 1) * pageSize)
  )

  const canPrev = computed(() => page.value > 0)
  const canNext = computed(() => page.value < pageCount.value - 1)

  function nextPage() {
    if (canNext.value) page.value++
  }

  function prevPage() {
    if (canPrev.value) page.value--
  }

  function resetPage() {
    page.value = 0
  }

  return { page, pageCount, pageItems, canPrev, canNext, nextPage, prevPage, resetPage }
}
