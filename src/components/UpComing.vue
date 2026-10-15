<template>
  <movie-slider v-if="upComingMovies.length" :movie-data="upComingMovies" :title="title" :show-footer="true"></movie-slider>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import { chunk } from '@/utils/collection'

const upComingMovies = ref([])
const title = 'COMING SOON'

onMounted(async () => {
  const response = await api.getUpComing()
  upComingMovies.value = chunk(response.data.results, 6)
})
</script>

