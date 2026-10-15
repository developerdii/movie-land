<template>
  <div v-if="upComingMovies.length">
    <section-heading eyebrow="In Theaters" title="Coming Soon" />
    <movie-slider :movie-data="upComingMovies" :show-footer="true" :show-position="false"></movie-slider>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import SectionHeading from '../components/SectionHeading.vue'
import { chunk, trimToChunks } from '@/utils/collection'

const upComingMovies = ref([])

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  const response = await api.getUpComing(today)
  upComingMovies.value = chunk(trimToChunks(response.data.results || []), 6)
})
</script>

