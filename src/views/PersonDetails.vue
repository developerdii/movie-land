<template>
  <div v-if="!loading" class="container-xxl">
    <div class="row g-4">
      <div class="col-md-3 col-lg-2">
        <img v-if="person.profile_path" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" class="rounded w-100" :alt="person.name">
        <div v-else class="person-profile-placeholder"><i class="bi bi-person"></i></div>
      </div>
      <div class="col-md-9 col-lg-10">
        <div class="eyebrow mb-1">Person</div>
        <h1 class="h2 fw-bold mb-2">{{ person.name }}</h1>
        <div class="d-flex flex-wrap gap-2 gap-lg-3 text-muted small">
          <span v-if="person.known_for_department">{{ person.known_for_department }}</span>
          <span v-if="person.birthday">• {{ formatDate(person.birthday, 'MMM Do YY') }}</span>
          <span v-if="person.popularity">• Popularity {{ person.popularity.toFixed(0) }}</span>
        </div>
        <p v-if="person.biography" class="mt-4 text-muted" style="max-width: 60rem; line-height: 1.7">{{ person.biography }}</p>
      </div>
    </div>

    <section v-if="movieCredits.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Filmography — Movies</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="movie in movieCredits" :key="movie.id" class="col">
          <div class="movie-card" @click="goTo('movie', movie.id)">
            <img v-if="movie.poster_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path" :alt="movie.title">
            <div v-else class="poster-placeholder"><i class="bi bi-film"></i></div>
            <p class="description p-2 text-center mb-0 pb-0">{{ movie.title }}</p>
            <div class="p-2 text-center footer">{{ movie.release_date ? movie.release_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="tvCredits.length" class="mt-5">
      <h2 class="section-title h4 mb-4">Filmography — TV Shows</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="tv in tvCredits" :key="tv.id" class="col">
          <div class="movie-card" @click="goTo('tv', tv.id)">
            <img v-if="tv.poster_path" class="card-img-top" :src="'https://image.tmdb.org/t/p/w500' + tv.poster_path" :alt="tv.name">
            <div v-else class="poster-placeholder"><i class="bi bi-film"></i></div>
            <p class="description p-2 text-center mb-0 pb-0">{{ tv.name }}</p>
            <div class="p-2 text-center footer">{{ tv.first_air_date ? tv.first_air_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const person = ref({})
const movieCredits = ref([])
const tvCredits = ref([])
const loading = ref(true)

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function load() {
  loading.value = true
  const id = route.query.id
  try {
    const [d, m, t] = await Promise.all([
      api.getPersonDetails(id),
      api.getPersonMovieCredits(id),
      api.getPersonTvCredits(id)
    ])
    person.value = d.data
    movieCredits.value = (m.data.cast || []).slice(0, 12)
    tvCredits.value = (t.data.cast || []).slice(0, 12)
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, load)
onMounted(load)
</script>
