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

    <media-section v-if="cast.length" :items="cast" />

    <section v-if="recommendations.length" class="detail-section">
      <section-heading eyebrow="More Like This" title="Recommended Movies">
        <template #actions>
          <div v-if="recTotal > 1" class="round-pagination">
            <button type="button" class="round-pagination-btn" :disabled="recIndex <= 1" aria-label="Previous recommendations" data-bs-target="#recommendations-carousel" data-bs-slide="prev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
            </button>
            <span class="round-pagination-count" aria-live="polite">{{ recIndex }} / {{ recTotal }}</span>
            <button type="button" class="round-pagination-btn" :disabled="recIndex >= recTotal" aria-label="Next recommendations" data-bs-target="#recommendations-carousel" data-bs-slide="next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>
        </template>
      </section-heading>
      <movie-slider id="recommendations-carousel" :movie-data="recommendationChunks" :show-footer="false" :show-arrows="false" :show-position="false" @slid="onRecSlid"></movie-slider>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import MediaSection from '../components/MediaSection.vue'
import SectionHeading from '../components/SectionHeading.vue'
import { formatDate } from '@/utils/date'
import { chunk, trimToChunks } from '@/utils/collection'
import { getLanguageName } from '@/utils/language'
import AsyncImage from '../components/AsyncImage.vue'

const route = useRoute()
const router = useRouter()

const movieData = ref({})
const cast = ref([])
const crew = ref([])
const recommendations = ref([])
const loading = ref(true)

const recommendationChunks = computed(() => chunk(recommendations.value, 6))
const recIndex = ref(1)
const recTotal = computed(() => recommendationChunks.value.length)

function onRecSlid(payload) {
  recIndex.value = payload.index
}
const directors = computed(() => [...new Map(crew.value.filter(person => person.job === 'Director').map(person => [person.id, person])).values()])
const writers = computed(() => [...new Map(crew.value.filter(person => ['Writer', 'Screenplay', 'Story'].includes(person.job)).map(person => [person.id, person])).values()])

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
    cast.value = (c.data.cast || [])
    crew.value = c.data.crew || []
    recommendations.value = trimToChunks(r.data.results || [])
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, loadPage)
onMounted(loadPage)
</script>
