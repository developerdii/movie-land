<template>
  <div v-if="!loading" class="container-xxl">
    <div class="mb-4">
      <div class="eyebrow mb-1">Movie · {{ formatDate(movieData.release_date, 'YYYY') }}</div>
      <h1 class="h2 fw-bold mb-2">{{ movieData.title }}</h1>
      <div class="d-flex flex-wrap align-items-center gap-2 gap-lg-3 text-muted small">
        <span v-if="movieData.vote_average" class="text-warning fw-bold"><i class="bi bi-star-fill me-1"></i>{{ movieData.vote_average.toFixed(1) }} / 10</span>
        <span v-if="movieData.runtime">• {{ movieData.runtime }} min</span>
        <span class="d-flex flex-wrap gap-1"><span v-for="g in movieData.genres" :key="g.id" class="badge text-bg-light border">{{ g.name }}</span></span>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4 col-lg-3">
        <img v-if="movieData.poster_path" :src="'https://image.tmdb.org/t/p/w500' + movieData.poster_path" class="rounded w-100" :alt="movieData.title">
        <div v-else class="person-profile-placeholder"><i class="bi bi-film"></i></div>
      </div>
      <div class="col-md-8 col-lg-9">
        <p v-if="movieData.tagline" class="fst-italic text-muted">{{ movieData.tagline }}</p>
        <p class="mt-3 text-muted" style="line-height: 1.7">{{ movieData.overview }}</p>
        <div class="row g-2 mt-4">
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Runtime</div><div class="value">{{ movieData.runtime }} min</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Released</div><div class="value">{{ formatDate(movieData.release_date, 'MMM Do YY') }}</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Language</div><div class="value">{{ (movieData.original_language || '').toUpperCase() }}</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Rating</div><div class="value">{{ movieData.vote_average ? movieData.vote_average.toFixed(1) : '' }}</div></div></div>
        </div>
      </div>
    </div>

    <section v-if="cast.length" class="mt-5">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <h2 class="section-title h4 mb-0">Cast</h2>
        <button class="btn btn-outline-secondary btn-sm" @click="showCastAsList = !showCastAsList">
          <i :class="showCastAsList ? 'bi bi-collection-play' : 'bi bi-list-ul'"></i>
          {{ showCastAsList ? 'Slider View' : 'List View' }}
        </button>
      </div>

      <slider v-if="!showCastAsList" id="cast-carousel">
        <template #card>
          <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in castChunks" :key="index">
            <div class="row pe-3 ps-3">
              <div class="col-md-3 p-1 d-flex" v-for="person in row" :key="person.id">
                <div class="movie-card" @click="goTo('person', person.id)">
                  <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" :alt="person.name">
                  <p class="description p-2 text-center mb-0 pb-0">{{ person.name }}</p>
                  <div class="p-2 text-center footer">{{ person.character }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </slider>

      <div v-else class="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3">
        <div v-for="person in cast" :key="person.id" class="col">
          <div class="movie-card" @click="goTo('person', person.id)">
            <img v-if="person.profile_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" :alt="person.name">
            <div v-else class="poster-placeholder"><i class="bi bi-person"></i></div>
            <p class="description p-2 text-center mb-0 pb-0">{{ person.name }}</p>
            <div class="p-2 text-center footer">{{ person.character }}</div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="recommendations.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Recommended Movies</h2>
      <movie-slider id="recommendations-carousel" :movie-data="recommendationChunks" :show-footer="false"></movie-slider>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import Slider from '../components/Slider.vue'
import MovieSlider from '../components/MovieSlider.vue'
import { formatDate } from '@/utils/date'
import { chunk } from '@/utils/collection'

const route = useRoute()
const router = useRouter()

const movieData = ref({})
const cast = ref([])
const recommendations = ref([])
const loading = ref(true)
const showCastAsList = ref(false)

const castChunks = computed(() => chunk(cast.value, 4))
const recommendationChunks = computed(() => chunk(recommendations.value, 6))

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function loadPage() {
  loading.value = true
  try {
    const [d, c, r] = await Promise.all([
      api.getMovieDetails(route.query.id),
      api.getMovieCredits(route.query.id),
      api.getRecommendationsMovies(route.query.id)
    ])
    movieData.value = d.data
    cast.value = (c.data.cast || []).filter(p => p.profile_path).slice(0, 24)
    recommendations.value = (r.data.results || []).slice(0, 12)
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, loadPage)
onMounted(loadPage)
</script>
