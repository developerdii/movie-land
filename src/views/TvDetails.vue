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

    <section v-if="cast.length" class="detail-section">
      <h2 class="section-title h4 mb-4">Cast</h2>
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
      <pagination-controls :page="castPage" :page-count="castPageCount" :can-prev="castCanPrev" :can-next="castCanNext" @prev="castPrevPage" @next="castNextPage" />
    </section>

    <section v-if="recommendations.length" class="detail-section">
      <h2 class="section-title h4 mb-4">Recommended TV Shows</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="rec in pagedRecommendations" :key="rec.id" class="col">
          <div class="movie-card" @click="goTo('tv', rec.id)">
            <async-image frame-class="card-img-frame" :src="rec.poster_path ? 'https://image.tmdb.org/t/p/w500' + rec.poster_path : ''" :alt="rec.name" />
            <p class="description p-2 text-center mb-0 pb-0">{{ rec.name }}</p>
            <div class="p-2 text-center footer">{{ rec.first_air_date ? rec.first_air_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
      <pagination-controls :page="recPage" :page-count="recPageCount" :can-prev="recCanPrev" :can-next="recCanNext" @prev="recPrevPage" @next="recNextPage" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { usePagination } from '@/composables/usePagination'
import PaginationControls from '../components/PaginationControls.vue'
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

const { page: castPage, pageCount: castPageCount, pageItems: pagedCast, canPrev: castCanPrev, canNext: castCanNext, nextPage: castNextPage, prevPage: castPrevPage, resetPage: resetCastPage } = usePagination(cast, 12)

const { page: recPage, pageCount: recPageCount, pageItems: pagedRecommendations, canPrev: recCanPrev, canNext: recCanNext, nextPage: recNextPage, prevPage: recPrevPage, resetPage: resetRecPage } = usePagination(recommendations, 12)
const directors = computed(() => [...new Map(crew.value.filter(person => person.job === 'Director').map(person => [person.id, person])).values()])
const writers = computed(() => [...new Map(crew.value.filter(person => ['Writer', 'Screenplay', 'Story'].includes(person.job)).map(person => [person.id, person])).values()])

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function load() {
  loading.value = true
  resetCastPage()
  resetRecPage()
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
    recommendations.value = (r.data.results || [])
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, load)
onMounted(load)
</script>
