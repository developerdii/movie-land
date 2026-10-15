<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="detail-heading">
      <h1 class="h2 fw-bold mb-2">{{ movieData.title }}</h1>
      <div class="detail-meta-row d-flex flex-wrap align-items-center gap-2 gap-lg-3 text-muted">
        <span v-if="movieData.runtime" class="detail-meta-item"><i class="bi bi-clock"></i>{{ movieData.runtime }} min</span>
        <span v-if="movieData.release_date" class="detail-meta-item"><i class="bi bi-calendar3"></i>{{ formatDate(movieData.release_date, 'MMM Do YY') }}</span>
        <span v-if="getLanguageName(movieData.original_language)" class="detail-meta-item">{{ getLanguageName(movieData.original_language) }}</span>
        <span class="d-flex flex-wrap gap-1"><span v-for="g in movieData.genres" :key="g.id" class="badge text-bg-light border">{{ g.name }}</span></span>
      </div>
    </div>

    <div class="row g-4 detail-content">
      <div class="col-5 col-sm-4 col-lg-3">
        <async-image frame-class="detail-poster" :src="movieData.poster_path ? 'https://image.tmdb.org/t/p/w500' + movieData.poster_path : ''" :alt="movieData.title" />
      </div>
      <div class="col-12 col-sm-8 col-lg-9 detail-copy">
        <div v-if="movieData.vote_average" class="detail-rating"><i class="bi bi-star-fill"></i><span>{{ movieData.vote_average.toFixed(1) }} <small>/ 10</small></span></div>
        <div class="detail-description">
          <div v-if="directors.length || writers.length" class="detail-credits">
            <div v-if="directors.length"><span class="detail-credit-label">Director</span><span class="detail-credit-links"><a v-for="(person, index) in directors" :key="person.id" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}<span v-if="index < directors.length - 1">, </span></a></span></div>
            <div v-if="writers.length"><span class="detail-credit-label">Writer</span><span class="detail-credit-links"><a v-for="(person, index) in writers" :key="person.id" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}<span v-if="index < writers.length - 1">, </span></a></span></div>
          </div>
          <p v-if="movieData.tagline" class="detail-tagline">{{ movieData.tagline }}</p>
          <p class="detail-overview">{{ movieData.overview }}</p>
        </div>
      </div>
    </div>

    <section v-if="cast.length" class="detail-section">
      <div class="cast-section-heading d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
        <h2 class="section-title h4 mb-0">Cast</h2>
        <div class="view-toggle" role="group" aria-label="Cast display mode">
          <button type="button" class="view-toggle-btn" :class="{ active: !showCastAsList }"
                  :aria-pressed="!showCastAsList" aria-label="Slider view" title="Slider view"
                  @click="showCastAsList = false">
            <i class="bi bi-collection-play-fill" aria-hidden="true"></i>
          </button>
          <button type="button" class="view-toggle-btn" :class="{ active: showCastAsList }"
                  :aria-pressed="showCastAsList" aria-label="List view" title="List view"
                  @click="showCastAsList = true">
            <i class="bi bi-list-ul" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <slider v-if="!showCastAsList" id="cast-carousel">
        <template #card>
          <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in castChunks" :key="index">
            <div class="row pe-3 ps-3">
              <div class="col-md-3 p-1 d-flex" v-for="person in row" :key="person.id">
                <div class="movie-card" @click="goTo('person', person.id)">
                  <async-image kind="person" frame-class="card-img-frame" :src="person.profile_path ? 'https://image.tmdb.org/t/p/w500' + person.profile_path : ''" :alt="person.name" />
                  <p class="description p-2 text-center mb-0 pb-0">{{ person.name }}</p>
                  <div class="p-2 text-center footer">{{ person.character }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </slider>

      <div v-else>
        <div class="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3 cast-list-grid">
          <div v-for="person in pagedCast" :key="person.id" class="col">
            <div class="movie-card" @click="goTo('person', person.id)">
              <async-image kind="person" frame-class="cast-card-image" :src="person.profile_path ? 'https://image.tmdb.org/t/p/w500' + person.profile_path : ''" :alt="person.name" />
              <p class="description p-2 text-center mb-0 pb-0">{{ person.name }}</p>
              <div class="p-2 text-center footer">{{ person.character }}</div>
            </div>
          </div>
          <div v-for="slot in (castPageCount > 1 ? 12 - pagedCast.length : 0)" :key="`cast-placeholder-${slot}`" class="col cast-list-placeholder" aria-hidden="true">
            <div class="movie-card"><async-image kind="person" frame-class="cast-card-image" /><p class="description p-2 mb-0"></p><div class="footer p-2"></div></div>
          </div>
        </div>
        <pagination-controls :page="castPage" :page-count="castPageCount" :can-prev="castCanPrev" :can-next="castCanNext" @prev="castPrev" @next="castNext" />
      </div>
    </section>

    <section v-if="recommendations.length" class="detail-section">
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
import { usePagination } from '@/composables/usePagination'
import PaginationControls from '../components/PaginationControls.vue'
import { getLanguageName } from '@/utils/language'
import AsyncImage from '../components/AsyncImage.vue'

const route = useRoute()
const router = useRouter()

const movieData = ref({})
const cast = ref([])
const crew = ref([])
const recommendations = ref([])
const loading = ref(true)
const showCastAsList = ref(false)

const {
  page: castPage,
  pageCount: castPageCount,
  pageItems: pagedCast,
  canPrev: castCanPrev,
  canNext: castCanNext,
  nextPage: castNext,
  prevPage: castPrev,
  resetPage: resetCastPage
} = usePagination(cast, 12)

const castChunks = computed(() => chunk(cast.value, 4))
const recommendationChunks = computed(() => chunk(recommendations.value, 6))
const directors = computed(() => [...new Map(crew.value.filter(person => person.job === 'Director').map(person => [person.id, person])).values()])
const writers = computed(() => [...new Map(crew.value.filter(person => ['Writer', 'Screenplay', 'Story'].includes(person.job)).map(person => [person.id, person])).values()])

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function loadPage() {
  loading.value = true
  resetCastPage()
  try {
    const [d, c, r] = await Promise.all([
      api.getMovieDetails(route.query.id),
      api.getMovieCredits(route.query.id),
      api.getRecommendationsMovies(route.query.id)
    ])
    movieData.value = d.data
    cast.value = (c.data.cast || []).filter(p => p.profile_path)
    crew.value = c.data.crew || []
    recommendations.value = (r.data.results || [])
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, loadPage)
onMounted(loadPage)
</script>
