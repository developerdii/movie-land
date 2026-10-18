<template>
  <div v-if="pageCount > 1" class="progress-pagination">
    <div class="progress-pagination-nav">
      <button
        type="button"
        class="progress-pagination-btn"
        :disabled="disabled || shownPage <= 1"
        aria-label="Previous page"
        @click="requestPage(shownPage - 1)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
      </button>
      <button
        type="button"
        class="progress-pagination-btn"
        :disabled="disabled || shownPage >= pageCount"
        aria-label="Next page"
        @click="requestPage(shownPage + 1)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
      </button>
    </div>
    <div class="progress-pagination-progress">
      <span class="progress-pagination-current">{{ pad(shownPage) }}</span>
      <progress-track :value="shownPage" :page-count="pageCount" :disabled="disabled" @change="requestPage" />
      <span class="progress-pagination-total">{{ pad(pageCount) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ProgressTrack from './ProgressTrack.vue'

// The page control for the lists that page in the browser (the home carousels, related titles, the cast and the
// filmography, Born Today) and for the bookmark results. It is the hero's "Up next" control: round arrows, the current
// page, the progress track, and the total. Browse keeps RoundPagination, where the page number is typed in. `page` is 1-based.
const props = defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:page'])

// The page the user is on or moving to. It shows ahead of the carousel while the carousel catches up.
const target = ref(null)
// True while a page change is on its way: the carousel reports the new page once its slide has finished.
let moving = false
const shownPage = computed(() => target.value ?? props.page)

const pad = (n) => String(n).padStart(2, '0')

function send() {
  moving = true
  emit('update:page', target.value)
}

// One page change at a time. A request made during a slide only moves the target, and the slide that finishes next
// sends it on, so the carousel never queues a backlog of slides while the pointer moves.
function requestPage(page) {
  if (props.disabled || page < 1 || page > props.pageCount) return
  target.value = page
  if (moving) return
  if (page === props.page) target.value = null
  else send()
}

watch(() => props.page, () => {
  moving = false
  if (target.value === null || target.value === props.page) target.value = null
  else send()
})
</script>

<style lang="scss">
.progress-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 100%;
}

.progress-pagination-nav { display: flex; align-items: center; gap: 8px; }

.progress-pagination-btn {
  flex: none;
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
  transition: background-color .15s ease, color .15s ease;
}
.progress-pagination-btn:hover:not(:disabled) { background: var(--ml-control-bg); color: var(--ml-brand-accent); }
.progress-pagination-btn:disabled { opacity: .35; cursor: default; }
.progress-pagination-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.progress-pagination-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.progress-pagination-current {
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: 22px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--ml-ink);
}

.progress-pagination-total {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ml-muted);
}

/* Phones: smaller arrows, and a shorter track so the row fits beside the heading. */
@media (max-width: 767.98px) {
  .progress-pagination-btn { width: 44px; height: 44px; }
  .progress-pagination .progress-track { width: 140px; }
}
</style>
