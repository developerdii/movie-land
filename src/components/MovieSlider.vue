<template>
  <slider :id="id" :show-indicators="showIndicators" :show-position="showPosition" :show-arrows="showArrows" @slid="$emit('slid', $event)">
    <template #card>
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in movieData" :key="index">
        <div class="row pe-3 ps-3">
          <div class="col-md-2 p-1 d-flex" v-for="(movie, movieIndex) in row" :key="movieIndex" @click="route(movie.id)">
            <div class="movie-card">
              <async-image :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" :alt="titleOf(movie)" frame-class="card-img-frame" image-class="card-img-top" />
              <p class="description p-2 text-center mb-0 pb-0">{{ titleOf(movie) }}</p>
              <div v-if="showFooter" class="p-2 text-center footer">{{ formatDate(dateOf(movie), 'MMM Do YY') }}</div>
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
import AsyncImage from './AsyncImage.vue'
import { formatDate } from '@/utils/date'

const props = defineProps({
  movieData: { type: Array, default: null },
  showFooter: { type: Boolean, default: true },
  id: { type: String, default: 'carouselExampleIndicators2' },
  showIndicators: { type: Boolean, default: false },
  showPosition: { type: Boolean, default: true },
  showArrows: { type: Boolean, default: true },
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
</script>
