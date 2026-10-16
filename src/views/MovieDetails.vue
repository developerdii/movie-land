<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="detail-hero">
      <div class="detail-hero-poster">
        <async-image frame-class="detail-poster" :src="movieData.poster_path ? 'https://image.tmdb.org/t/p/w500' + movieData.poster_path : ''" :alt="movieData.title" />
      </div>
      <div class="detail-hero-content">
        <header class="detail-hero-header">
          <div v-if="movieData.genres && movieData.genres.length" class="detail-tags">
            <span v-for="g in movieData.genres" :key="g.id" class="detail-tag">{{ g.name }}</span>
          </div>
          <h1 class="detail-title">{{ movieData.title }}</h1>
          <div class="detail-meta-row">
            <span v-if="movieData.vote_average" class="detail-rating-badge">
              <i class="bi bi-star-fill" aria-hidden="true"></i>
              <span class="detail-rating-value">{{ movieData.vote_average.toFixed(1) }}</span>
              <span class="detail-rating-scale">/ 10</span>
            </span>
            <span v-if="movieData.runtime" class="detail-meta-item"><i class="bi bi-clock" aria-hidden="true"></i>{{ formatRuntime(movieData.runtime) }}</span>
            <span v-if="movieData.release_date" class="detail-meta-item"><i class="bi bi-calendar3" aria-hidden="true"></i>{{ formatDate(movieData.release_date, 'MMM D, YYYY') }}</span>
            <span v-if="getLanguageName(movieData.original_language)" class="detail-meta-item"><i class="bi bi-globe2" aria-hidden="true"></i>{{ getLanguageName(movieData.original_language) }}</span>
          </div>
        </header>

        <dl v-if="directors.length || writers.length" class="detail-facts">
          <div v-if="mergedDirectorWriter" class="detail-fact">
            <dt>Director &amp; Writer</dt>
            <dd>
              <a class="detail-person" :href="`/person?id=${mergedDirectorWriter.id}`" @click.prevent="goTo('person', mergedDirectorWriter.id)">{{ mergedDirectorWriter.name }}</a>
            </dd>
          </div>
          <template v-else>
            <div v-if="directors.length" class="detail-fact">
              <dt>Director</dt>
              <dd>
                <template v-for="(person, index) in directors" :key="person.id">
                  <a class="detail-person" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}</a><span v-if="index < directors.length - 1" class="detail-fact-sep">,</span>
                </template>
              </dd>
            </div>
            <div v-if="writers.length" class="detail-fact">
              <dt>{{ writerLabel }}</dt>
              <dd>
                <template v-for="(person, index) in writers" :key="person.id">
                  <a class="detail-person" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}</a><span v-if="index < writers.length - 1" class="detail-fact-sep">,</span>
                </template>
              </dd>
            </div>
          </template>
        </dl>

        <div class="detail-overview-block">
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
            <button type="button" class="round-pagination-btn" :disabled="recIndex <= 1" :aria-disabled="recIndex <= 1" aria-label="Previous recommendations" data-bs-target="#recommendations-carousel" data-bs-slide="prev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
            </button>
            <span class="round-pagination-count" aria-live="polite">{{ recIndex }} / {{ recTotal }}</span>
            <button type="button" class="round-pagination-btn" :disabled="recIndex >= recTotal" :aria-disabled="recIndex >= recTotal" aria-label="Next recommendations" data-bs-target="#recommendations-carousel" data-bs-slide="next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>
        </template>
      </section-heading>
      <movie-slider id="recommendations-carousel" variant="movie" :movie-data="recommendationChunks" :show-arrows="false" :show-position="false" @slid="onRecSlid"></movie-slider>
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
const mergedDirectorWriter = computed(() => {
  if (directors.value.length === 1 && writers.value.length === 1 && directors.value[0].id === writers.value[0].id) {
    return directors.value[0]
  }
  return null
})
const writerLabel = computed(() => (writers.value.length === 1 ? 'Writer' : 'Writers'))

function formatRuntime(minutes) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

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
