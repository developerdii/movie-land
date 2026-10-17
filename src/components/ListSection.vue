<template>
  <div v-if="slides.length">
    <section-heading :eyebrow="eyebrow" :title="title">
      <template #actions>
        <div v-if="slides.length > 1" class="round-pagination">
          <button type="button" class="round-pagination-btn" :disabled="index <= 1" :aria-disabled="index <= 1" aria-label="Previous" :data-bs-target="'#' + id" data-bs-slide="prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
          </button>
          <span class="round-pagination-count" aria-live="polite">{{ index }} / {{ slides.length }}</span>
          <button type="button" class="round-pagination-btn" :disabled="index >= slides.length" :aria-disabled="index >= slides.length" aria-label="Next" :data-bs-target="'#' + id" data-bs-slide="next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
          </button>
        </div>
      </template>
    </section-heading>
    <movie-slider :id="id" :movie-data="slides" :type="type" variant="movie" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
// A titled carousel of poster cards for one TMDB list (popular, top rated, ...). The section stays hidden
// when its request fails, so one broken list does not leave an empty heading on the home page.
import { onMounted, ref } from 'vue'
import MovieSlider from '@/components/MovieSlider.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { chunk, trimToChunks } from '@/utils/collection'

const props = defineProps({
  id: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  // 'movie' or 'tv': drives the card links and the poster metadata.
  type: { type: String, default: 'movie' },
  // Returns the axios promise for the list, e.g. api.getPopularMovies.
  load: { type: Function, required: true },
  // Fewer titles than this and the section stays hidden (one full slide is 6).
  minItems: { type: Number, default: 6 }
})

const slides = ref([])
const index = ref(1)

// The slider reports a 1-based slide number, the same as the page count shown beside the arrows.
function onSlid(payload) {
  index.value = payload.index
}

onMounted(async () => {
  try {
    const { data } = await props.load()
    const titles = trimToChunks(data.results || [], 6)
    slides.value = titles.length >= props.minItems ? chunk(titles, 6) : []
  } catch (error) {
    slides.value = []
  }
})
</script>
