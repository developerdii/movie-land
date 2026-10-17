<template>
  <button
    v-if="variant === 'pill'"
    type="button"
    class="bookmark-btn bookmark-btn--pill"
    :class="{ 'is-active': active }"
    :aria-label="active ? 'Remove bookmark' : 'Add bookmark'"
    @click="toggle(type, id)"
  >
    <i :class="active ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'" aria-hidden="true"></i>
    <span>{{ active ? 'Bookmarked' : 'Bookmark' }}</span>
  </button>
  <button
    v-else
    type="button"
    class="bookmark-btn bookmark-btn--ribbon"
    :class="{ 'is-active': active }"
    :aria-label="active ? 'Remove bookmark' : 'Add bookmark'"
    :title="active ? 'Remove bookmark' : 'Add bookmark'"
    @click="toggle(type, id)"
  >
    <i :class="active ? 'bi bi-check-lg' : 'bi bi-plus-lg'" aria-hidden="true"></i>
  </button>
</template>

<script setup>
// Adds or removes one movie, TV show or person from the bookmarks.
// 'ribbon' (default) is the bookmark tab at the top right of a detail page; 'pill' is the hero's button.
import { computed } from 'vue'
import { useBookmarks } from '@/composables/useBookmarks'

const props = defineProps({
  type: { type: String, required: true },
  id: { type: Number, required: true },
  variant: { type: String, default: 'ribbon' }
})

const { has, toggle } = useBookmarks()
const active = computed(() => has(props.type, props.id))
</script>

<style lang="scss">
.bookmark-btn {
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease, border-color .15s ease;
}

/* Pill: the hero's button. The hero's own button classes size it. */
.bookmark-btn--pill {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--ml-control-line);
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}
.bookmark-btn--pill i { font-size: 1rem; }
.bookmark-btn--pill:hover { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
.bookmark-btn--pill.is-active {
  border-color: var(--ml-brand-accent);
  background: rgba(var(--ml-brand-accent-rgb), .14);
  color: var(--ml-ink);
}
.bookmark-btn--pill:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

/* Ribbon: a bookmark tab that hangs from the top edge of the header card (.page-card), at the top right. Its right
   offset is the card padding (--card-pad) plus its own inset, so it sits where it did inside the old page card.
   Not bookmarked it is neutral with a plus; bookmarked it turns gold with a check, the same selected colour as the
   browse tabs. */
.bookmark-btn--ribbon {
  position: absolute;
  top: 0;
  right: calc(var(--card-pad) + clamp(12px, 3vw, 40px));
  z-index: 3;
  width: 44px;
  height: 60px;
  display: grid;
  place-items: center;
  padding: 0 0 14px;
  border: 0;
  border-radius: 0;
  background: var(--ml-hover);
  color: var(--ml-ink);
  font-size: 18px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 16px), 0 100%);
}
.bookmark-btn--ribbon:hover { background: rgba(var(--ml-brand-accent-rgb), .35); }
.bookmark-btn--ribbon.is-active { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }
/* The outline would be clipped by the notch, so focus shows as a tint instead. */
.bookmark-btn--ribbon:focus-visible { outline: none; background: rgba(var(--ml-brand-accent-rgb), .55); }

@media (max-width: 575.98px) {
  .bookmark-btn--ribbon { right: calc(var(--card-pad) + 12px); width: 36px; height: 52px; font-size: 15px; }
}
</style>
