<template>
  <div v-if="!loading" class="container-xxl">
    <div class="mb-3">
      <div class="eyebrow mb-1">TV Series</div>
      <h1 class="h2 fw-bold mb-2">{{ tv.name }} <span v-if="tv.first_air_date" class="text-muted fw-normal">({{ tv.first_air_date.slice(0, 4) }})</span></h1>
      <div class="d-flex flex-wrap align-items-center gap-2 gap-lg-3 text-muted small">
        <span v-if="tv.vote_average" class="text-warning fw-bold"><i class="bi bi-star-fill me-1"></i>{{ tv.vote_average.toFixed(1) }} / 10</span>
        <span v-if="tv.number_of_seasons">• {{ tv.number_of_seasons }} seasons</span>
        <span v-if="tv.episode_run_time && tv.episode_run_time.length">• {{ tv.episode_run_time[0] }} min</span>
        <span class="d-flex flex-wrap gap-1"><span v-for="g in tv.genres" :key="g.id" class="badge text-bg-light border">{{ g.name }}</span></span>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-md-4 col-lg-3">
        <img v-if="tv.poster_path" :src="'https://image.tmdb.org/t/p/w500' + tv.poster_path" class="rounded w-100" :alt="tv.name">
        <div v-else class="person-profile-placeholder"><i class="bi bi-tv"></i></div>
      </div>
      <div class="col-md-8 col-lg-9">
        <p v-if="tv.tagline" class="fst-italic text-muted">{{ tv.tagline }}</p>
        <p class="mt-3 text-muted" style="line-height: 1.7">{{ tv.overview }}</p>
      </div>
    </div>

    <section v-if="cast.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Cast</h2>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3">
        <div v-for="person in pagedCast" :key="person.id" class="col">
          <div class="movie-card" @click="goTo('person', person.id)">
            <img v-if="person.profile_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" :alt="person.name">
            <div v-else class="poster-placeholder"><i class="bi bi-person"></i></div>
            <p class="description p-2 text-center mb-0 pb-0">{{ person.name }}</p>
            <div class="p-2 text-center footer">{{ person.character }}</div>
          </div>
        </div>
      </div>
      <pagination-controls :page="castPage" :page-count="castPageCount" :can-prev="castCanPrev" :can-next="castCanNext" @prev="castPrevPage" @next="castNextPage" />
    </section>

    <section v-if="recommendations.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Recommended TV Shows</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="rec in pagedRecommendations" :key="rec.id" class="col">
          <div class="movie-card" @click="goTo('tv', rec.id)">
            <img v-if="rec.poster_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + rec.poster_path" :alt="rec.name">
            <div v-else class="poster-placeholder"><i class="bi bi-film"></i></div>
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
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { usePagination } from '@/composables/usePagination'
import PaginationControls from '../components/PaginationControls.vue'

const route = useRoute()
const router = useRouter()

const tv = ref({})
const cast = ref([])
const recommendations = ref([])
const loading = ref(true)

const { page: castPage, pageCount: castPageCount, pageItems: pagedCast, canPrev: castCanPrev, canNext: castCanNext, nextPage: castNextPage, prevPage: castPrevPage } = usePagination(cast, 12)

const { page: recPage, pageCount: recPageCount, pageItems: pagedRecommendations, canPrev: recCanPrev, canNext: recCanNext, nextPage: recNextPage, prevPage: recPrevPage } = usePagination(recommendations, 12)

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
