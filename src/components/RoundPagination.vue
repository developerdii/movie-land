<template>
  <div v-if="pageCount > 1" class="round-pagination">
    <button
      type="button"
      class="round-pagination-btn"
      :disabled="disabled || page <= 1"
      :aria-disabled="disabled || page <= 1"
      aria-label="Previous page"
      @click="go(page - 1)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
    </button>
    <div class="round-pagination-jump">
      <input
        type="number"
        inputmode="numeric"
        class="round-pagination-input"
        :value="page"
        :min="1"
        :max="pageCount"
        :disabled="disabled"
        :aria-label="'Current page, 1 to ' + pageCount"
        @change="jump"
        @keydown.enter.prevent="$event.target.blur()"
      >
      <span class="round-pagination-total" aria-live="polite">of {{ pageCount }}</span>
    </div>
    <button
      type="button"
      class="round-pagination-btn"
      :disabled="disabled || page >= pageCount"
      :aria-disabled="disabled || page >= pageCount"
      aria-label="Next page"
      @click="go(page + 1)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
    </button>
  </div>
</template>

<script setup>
// The browse page's switcher for its server-paged results, which can run to 500 pages, so the page number is typed in
// directly ("n of N"). Every other list uses ProgressPagination. `page` is 1-based. The parent decides what a page change does.
const props = defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:page'])

function go(target) {
  if (props.disabled || target < 1 || target > props.pageCount || target === props.page) return
  emit('update:page', target)
}

// Typed page numbers are clamped to 1..pageCount; anything unreadable goes back to the current page.
function jump(event) {
  const input = event.target
  const requested = Math.round(Number(input.value))
  const target = Number.isFinite(requested) && input.value !== ''
    ? Math.min(Math.max(requested, 1), props.pageCount)
    : props.page
  input.value = String(target)
  go(target)
}
</script>

<style lang="scss">
.round-pagination { display: flex; align-items: center; gap: 8px; }

.round-pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--ml-control-line);
  border-radius: 999px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  cursor: pointer;
  transition: border-color .15s ease, color .15s ease, background-color .15s ease;
}
.round-pagination-btn:hover:not(:disabled) { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
.round-pagination-btn:disabled { color: rgba(var(--ml-muted-rgb), .4); cursor: not-allowed; }
.round-pagination-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

/* The page number is typed in directly; the pill is the same height as the round buttons. */
.round-pagination-jump {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 48px;
  width: 128px;
  padding: 0 18px;
  border: 1px solid var(--ml-control-line);
  border-radius: 999px;
  background: var(--ml-surface);
  color: var(--ml-muted);
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.round-pagination-jump:focus-within { border-color: var(--ml-brand-accent); }
.round-pagination-input {
  flex: none;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ml-ink);
  font: inherit;
  font-weight: 700;
  text-align: right;
  -moz-appearance: textfield;
  appearance: textfield;
}
.round-pagination-input::-webkit-outer-spin-button,
.round-pagination-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.round-pagination-input:hover { background: var(--ml-control-bg); }
.round-pagination-input:focus { outline: none; background: var(--ml-control-bg); }
.round-pagination-total { white-space: nowrap; }

/* Phones: 16px stops iOS from zooming the page when the page number is typed. */
@media (max-width: 767.98px) {
  .round-pagination-input { font-size: 16px; }
  .round-pagination-btn { width: 44px; height: 44px; }
  .round-pagination-jump { height: 44px; width: 120px; padding: 0 12px; }
}
</style>
