<template>
  <slider :id="id" :show-indicators="showIndicators" :show-position="showPosition" :show-arrows="showArrows" @slid="$emit('slid', $event)">
    <template #card>
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in movieData" :key="index">
        <div class="movie-card-row">
          <a class="movie-card" v-for="(movie, movieIndex) in row" :key="movieIndex" :style="posterStyle(movie)" :href="`#/${type}?id=${movie.id}`" @click.prevent="route(movie.id)">
            <async-image :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" :alt="titleOf(movie)" frame-class="card-img-frame" image-class="card-img-top" />
            <span v-if="showRating && movie.vote_average" class="card-rating" aria-hidden="true">
              <i class="bi bi-star-fill"></i>{{ movie.vote_average.toFixed(1) }}
            </span>
            <div class="card-info">
              <p class="description">{{ titleOf(movie) }}</p>
              <div v-if="showFooter" class="footer">{{ formatDate(dateOf(movie), footerFormat) }}</div>
            </div>
          </a>
        </div>
      </div>
    </template>
  </slider>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Slider from './Slider.vue'
import AsyncImage from './AsyncImage.vue'
import { formatDate } from '@/utils/date'

const props = defineProps({
  movieData: { type: Array, default: null },
  showFooter: { type: Boolean, default: true },
  id: { type: String, default: 'carouselExampleIndicators2' },
  showIndicators: { type: Boolean, default: false },
  showPosition: { type: Boolean, default: true },
  showArrows: { type: Boolean, default: true },
  showRating: { type: Boolean, default: true },
  footerFormat: { type: String, default: 'MMM Do YY' },
  type: { type: String, default: 'movie' }
})

defineEmits(['slid'])

const router = useRouter()

function titleOf(item) {
  return props.type === 'tv' ? item.name : item.title
}

function dateOf(item) {
  return props.type === 'tv' ? item.first_air_date : item.release_date
}

function route(id) {
  router.push({ path: props.type, query: { id } })
}

function posterStyle(movie) {
  if (!movie.poster_path) return {}
  return { '--poster': `url('https://image.tmdb.org/t/p/w500${movie.poster_path}')` }
}
</script>
