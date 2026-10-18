<template>
  <div v-if="slides.length">
    <section-heading :eyebrow="eyebrow" :title="title">
      <template #actions>
        <progress-pagination :page="index" :page-count="slides.length" @update:page="goToSlide" />
      </template>
    </section-heading>
    <movie-slider ref="slider" :id="id" :movie-data="slides" :type="type" variant="movie" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
// A titled carousel of poster cards for one TMDB list (popular, top rated, ...). The section stays hidden
// when its request fails, so one broken list does not leave an empty heading on the home page.
import { onMounted, ref } from 'vue'
import MovieSlider from '@/components/MovieSlider.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import ProgressPagination from '@/components/ProgressPagination.vue'
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

const slider = ref(null)

// The page control is 1-based; the carousel is 0-based.
function goToSlide(page) {
  slider.value?.goTo(page - 1)
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
