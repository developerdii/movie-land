<template>
  <div v-if="upComingMovies.length">
    <section-heading eyebrow="In Theaters" title="Coming Soon">
      <template #actions>
        <round-pagination :page="recIndex" :page-count="recTotal" @update:page="goToRec" />
      </template>
    </section-heading>
    <movie-slider ref="slider" id="upcoming-carousel" variant="comingSoon" :movie-data="upComingMovies" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import SectionHeading from '../components/SectionHeading.vue'
import RoundPagination from '../components/RoundPagination.vue'
import { chunk, trimToChunks } from '@/utils/collection'

const upComingMovies = ref([])
const recIndex = ref(1)
const recTotal = computed(() => upComingMovies.value.length)

function onSlid(payload) {
  recIndex.value = payload.index
}

const slider = ref(null)

// The page control is 1-based; the carousel is 0-based.
function goToRec(page) {
  slider.value?.goTo(page - 1)
}

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  const response = await api.getUpComing(today)
  upComingMovies.value = chunk(trimToChunks(response.data.results || []), 6)
})
</script>

