<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="detail-heading">
      <h1 class="h2 fw-bold mb-2">{{ tv.name }}</h1>
      <div class="detail-meta-row d-flex flex-wrap align-items-center gap-2 gap-lg-3 text-muted">
        <span v-if="tv.number_of_seasons" class="detail-meta-item"><i class="bi bi-collection"></i>{{ tv.number_of_seasons }} seasons</span>
        <span v-if="tv.episode_run_time && tv.episode_run_time.length" class="detail-meta-item"><i class="bi bi-clock"></i>{{ tv.episode_run_time[0] }} min</span>
        <span v-if="tv.first_air_date" class="detail-meta-item"><i class="bi bi-calendar3"></i>{{ formatDate(tv.first_air_date, 'MMM Do YY') }}</span>
        <span v-if="getLanguageName(tv.original_language)" class="detail-meta-item">{{ getLanguageName(tv.original_language) }}</span>
        <span class="d-flex flex-wrap gap-1"><span v-for="g in tv.genres" :key="g.id" class="badge text-bg-light border">{{ g.name }}</span></span>
      </div>
    </div>

    <div class="row g-4 detail-content">
      <div class="col-5 col-sm-4 col-lg-3">
        <async-image frame-class="detail-poster" :src="tv.poster_path ? 'https://image.tmdb.org/t/p/w500' + tv.poster_path : ''" :alt="tv.name" />
      </div>
      <div class="col-12 col-sm-8 col-lg-9 detail-copy">
        <div v-if="tv.vote_average" class="detail-rating"><i class="bi bi-star-fill"></i><span>{{ tv.vote_average.toFixed(1) }} <small>/ 10</small></span></div>
        <div class="detail-description">
          <div v-if="directors.length || writers.length" class="detail-credits">
            <div v-if="directors.length"><span class="detail-credit-label">Director</span><span class="detail-credit-links"><a v-for="(person, index) in directors" :key="person.id" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}<span v-if="index < directors.length - 1">, </span></a></span></div>
            <div v-if="writers.length"><span class="detail-credit-label">Writer</span><span class="detail-credit-links"><a v-for="(person, index) in writers" :key="person.id" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}<span v-if="index < writers.length - 1">, </span></a></span></div>
          </div>
          <p v-if="tv.tagline" class="detail-tagline">{{ tv.tagline }}</p>
          <p class="detail-overview">{{ tv.overview }}</p>
        </div>
      </div>
    </div>

    <media-section v-if="cast.length" :items="cast" />

    <section v-if="recommendations.length" class="detail-section">
      <section-heading eyebrow="More Like This" title="Recommended TV Shows">
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
      <movie-slider id="recommendations-carousel" type="tv" :movie-data="recommendationChunks" :show-footer="false" :show-arrows="false" :show-position="false" @slid="onRecSlid"></movie-slider>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import MediaSection from '../components/MediaSection.vue'
import SectionHeading from '../components/SectionHeading.vue'
import MovieSlider from '../components/MovieSlider.vue'
import { chunk, trimToChunks } from '@/utils/collection'
import { formatDate } from '@/utils/date'
import { getLanguageName } from '@/utils/language'
import AsyncImage from '../components/AsyncImage.vue'

const route = useRoute()
const router = useRouter()

const tv = ref({})
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

async function load() {
  loading.value = true
  const id = route.query.id
  try {
    const [d, c, r] = await Promise.all([
      api.getTvDetails(id),
      api.getTvCredits(id),
      api.getTvRecommendations(id)
    ])
    tv.value = d.data
    cast.value = (c.data.cast || [])
    crew.value = c.data.crew || []
    recommendations.value = trimToChunks(r.data.results || [])
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, load)
onMounted(load)
</script>
