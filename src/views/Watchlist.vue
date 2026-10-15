<template>
  <div class="container-xxl py-4">
    <h1 class="h3 mb-1">İzleme Listem</h1>
    <p class="text-muted mb-4">TMDB hesabındaki izleme listen.</p>

    <div v-if="!auth.isAuthenticated" class="alert alert-info">
      İzleme listesini görmek için <a href="#" @click.prevent="login">giriş yapmalısın</a>.
    </div>
    <div v-else-if="loading" class="text-center text-muted py-5">Yükleniyor...</div>
    <div v-else-if="!movies.length" class="text-center text-muted py-5">
      <i class="bi bi-bookmark fs-1 d-block mb-2"></i>İzleme listen boş.
    </div>
    <div v-else class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
      <div v-for="movie in movies" :key="movie.id" class="col">
        <div class="movie-card" @click="route(movie.id)">
          <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path">
          <p class="description p-2 text-center mb-0 pb-0">{{ movie.title }}</p>
          <div class="p-2 text-center footer">{{ movie.release_date ? movie.release_date.slice(0, 4) : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const movies = ref([])
const loading = ref(false)

function login() {
  auth.startLogin()
}

function route(id) {
  router.push({ path: 'movie', query: { id } })
}

onMounted(async () => {
  if (!auth.isAuthenticated) return
  loading.value = true
  try {
    const { data } = await api.getWatchlistMovies(auth.accountId, auth.sessionId)
    movies.value = data.results
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
})
</script>
