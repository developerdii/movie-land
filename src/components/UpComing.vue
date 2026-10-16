<template>
  <div v-if="upComingMovies.length">
    <section-heading eyebrow="In Theaters" title="Coming Soon">
      <template #actions>
        <div v-if="recTotal > 1" class="round-pagination">
          <button type="button" class="round-pagination-btn" :disabled="recIndex <= 1" aria-label="Previous" data-bs-target="#upcoming-carousel" data-bs-slide="prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
          </button>
          <span class="round-pagination-count" aria-live="polite">{{ recIndex }} / {{ recTotal }}</span>
          <button type="button" class="round-pagination-btn" :disabled="recIndex >= recTotal" aria-label="Next" data-bs-target="#upcoming-carousel" data-bs-slide="next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
          </button>
        </div>
      </template>
    </section-heading>
    <movie-slider id="upcoming-carousel" variant="comingSoon" :movie-data="upComingMovies" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import SectionHeading from '../components/SectionHeading.vue'
import { chunk, trimToChunks } from '@/utils/collection'

const upComingMovies = ref([])
const recIndex = ref(1)
const recTotal = computed(() => upComingMovies.value.length)

function onSlid(payload) {
  recIndex.value = payload.index
}

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  const response = await api.getUpComing(today)
  upComingMovies.value = chunk(trimToChunks(response.data.results || []), 6)
})
</script>

