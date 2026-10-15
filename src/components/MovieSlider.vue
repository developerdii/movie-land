<template>
  <slider :id="id">
    <template #title>
      <div v-if="title">
        <h2 class="container-title mb-0">{{ title }}</h2>
      </div>
    </template>
    <template #card>
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in movieData" :key="index">
        <div class="row pe-3 ps-3">
          <div class="col-md-2 p-1 d-flex" v-for="(movie, movieIndex) in row" :key="movieIndex" @click="route(movie.id)">
            <div class="movie-card">
              <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path">
              <p class="description p-2 text-center mb-0 pb-0">{{ movie.title }}</p>
              <div v-if="showFooter" class="p-2 text-center footer">{{ formatDate(movie.release_date, 'MMM Do YY') }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </slider>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Slider from './Slider.vue'
import { formatDate } from '@/utils/date'

defineProps({
  movieData: { type: Array, default: null },
  showFooter: { type: Boolean, default: true },
  title: { type: String, default: null },
  id: { type: String, default: 'carouselExampleIndicators2' }
})

const router = useRouter()

function route(id) {
  router.push({ path: 'movie', query: { id } })
}
</script>
