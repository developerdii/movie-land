<template>
  <section class="detail-section media-strip" aria-label="Photos" :aria-busy="loading">
    <span class="section-heading-eyebrow">Photos</span>
    <div class="media-strip__grid">
      <template v-if="loading">
        <span
          v-for="n in max"
          :key="'skeleton-' + n"
          class="media-strip__tile media-strip__tile--skeleton skeleton-shimmer"
          aria-hidden="true"
        ></span>
        <span class="visually-hidden" role="status">Loading photos</span>
      </template>

      <template v-else>
        <button
          v-for="(item, i) in visible"
          :key="item.path + i"
          type="button"
          class="media-strip__tile"
          :aria-label="i === visible.length - 1 && remaining ? 'Open photos, ' + remaining + ' more' : 'Open photo ' + (i + 1)"
          @click="emit('open', i)"
        >
          <img :src="imageUrl(item.path, 'w500')" alt="" loading="lazy">
          <span v-if="i === visible.length - 1 && remaining" class="media-strip__more" aria-hidden="true">+{{ remaining }}</span>
        </button>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { imageUrl } from '@/utils/images'

// A compact strip of at most `max` photos. The last tile shows how many more there are.
// While `loading`, it shows `max` skeleton tiles of the same size.
const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ path }]
  max: { type: Number, default: 6 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['open'])

const visible = computed(() => props.items.slice(0, props.max))
const remaining = computed(() => Math.max(props.items.length - props.max, 0))
</script>

<style lang="scss">
.media-strip { display: flex; flex-direction: column; gap: 12px; }

/* Tighter spacing around the photo strip than the default section gap. */
.detail-section.media-strip { margin-top: 2rem; }
.detail-section.media-strip + .cast-section { margin-top: 2rem; }

.media-strip__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.media-strip__tile {
  position: relative;
  aspect-ratio: 16 / 9;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--ml-brand-dark);
  cursor: zoom-in;
  transition: transform .2s ease, box-shadow .2s ease;
}
.media-strip__tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}
.media-strip__tile:hover { transform: translateY(-2px); box-shadow: 0 0 0 2px var(--ml-brand-accent); }
.media-strip__tile:hover img { transform: scale(1.04); }
.media-strip__tile:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

/* Skeleton tiles keep the same size as the photos they stand in for. */
.media-strip__tile--skeleton {
  display: block;
  cursor: default;
  background: #eceef2;
}
.media-strip__tile--skeleton:hover { transform: none; box-shadow: none; }

.media-strip__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(var(--ml-brand-dark-rgb), .6);
  color: #fff;
  font-size: 20px;
  font-weight: 800;
}

@media (max-width: 767.98px) {
  .media-strip__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
