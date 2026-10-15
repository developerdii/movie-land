<template>
  <div v-if="!loading" class="container-xxl">
    <div class="mb-4">
      <div class="eyebrow mb-1">Film · {{ formatDate(movieData.release_date, 'YYYY') }}</div>
      <h1 class="h2 fw-bold mb-2">{{ movieData.title }}</h1>
      <div class="d-flex flex-wrap align-items-center gap-2 gap-lg-3 text-muted small">
        <span v-if="movieData.vote_average" class="text-warning fw-bold"><i class="bi bi-star-fill me-1"></i>{{ movieData.vote_average.toFixed(1) }} / 10</span>
        <span v-if="movieData.runtime">• {{ movieData.runtime }} dk</span>
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
        <div class="d-flex flex-wrap gap-2 mt-4 align-items-center">
          <button class="btn btn-outline-danger btn-sm" @click="toggleFavorite"><i class="bi bi-heart me-1"></i>Favorilere Ekle</button>
          <button class="btn btn-outline-primary btn-sm" @click="toggleWatchlist"><i class="bi bi-bookmark me-1"></i>İzleme Listesine Ekle</button>
          <span v-if="statusMessage" class="text-success small">{{ statusMessage }}</span>
        </div>
        <div class="row g-2 mt-4">
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Süre</div><div class="value">{{ movieData.runtime }} dk</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Çıkış</div><div class="value">{{ formatDate(movieData.release_date, 'MMM Do YY') }}</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Dil</div><div class="value">{{ (movieData.original_language || '').toUpperCase() }}</div></div></div>
          <div class="col-6 col-md-3"><div class="fact"><div class="label">Puan</div><div class="value">{{ movieData.vote_average ? movieData.vote_average.toFixed(1) : '' }}</div></div></div>
        </div>
      </div>
    </div>

    <section v-if="cast.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Oyuncular</h2>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3">
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
      <h2 class="section-title h4 mb-4">Önerilen Filmler</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="rec in recommendations" :key="rec.id" class="col">
          <div class="movie-card" @click="goTo('movie', rec.id)">
            <img v-if="rec.poster_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + rec.poster_path" :alt="rec.title">
            <div v-else class="poster-placeholder"><i class="bi bi-film"></i></div>
            <p class="description p-2 text-center mb-0 pb-0">{{ rec.title }}</p>
            <div class="p-2 text-center footer">{{ rec.release_date ? rec.release_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const movieData = ref({})
const cast = ref([])
const recommendations = ref([])
const loading = ref(true)
const statusMessage = ref('')

const movieId = computed(() => Number(route.query.id))

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function toggleFavorite() {
  if (!auth.isAuthenticated) {
    await auth.startLogin()
    return
  }
  try {
    await api.markFavorite(auth.accountId, auth.sessionId, movieId.value, true)
    statusMessage.value = 'Favorilere eklendi'
  } catch (e) {
    statusMessage.value = 'Hata oluştu'
    console.log(e)
  }
  setTimeout(() => (statusMessage.value = ''), 2500)
}

async function toggleWatchlist() {
  if (!auth.isAuthenticated) {
    await auth.startLogin()
    return
  }
  try {
    await api.addToWatchlist(auth.accountId, auth.sessionId, movieId.value, true)
    statusMessage.value = 'İzleme listesine eklendi'
  } catch (e) {
    statusMessage.value = 'Hata oluştu'
    console.log(e)
  }
  setTimeout(() => (statusMessage.value = ''), 2500)
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
    cast.value = (c.data.cast || []).filter(p => p.profile_path).slice(0, 12)
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
