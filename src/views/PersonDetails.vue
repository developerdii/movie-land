<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="row g-4 detail-content person-detail-content">
      <div class="col-5 col-sm-4 col-lg-3">
        <async-image kind="person" frame-class="detail-poster" :src="person.profile_path ? 'https://image.tmdb.org/t/p/w500' + person.profile_path : ''" :alt="person.name" />
      </div>
      <div class="col-12 col-sm-8 col-lg-9">
        <h1 class="h2 fw-bold mb-2">{{ person.name }}</h1>
        <div class="detail-meta-row d-flex flex-wrap align-items-center gap-2 gap-lg-3">
          <span v-if="person.known_for_department" class="detail-meta-item"><i class="bi bi-briefcase"></i>{{ person.known_for_department }}</span>
          <span v-if="person.birthday" class="detail-meta-item"><i class="bi bi-calendar3"></i>{{ formatDate(person.birthday, 'MMM Do YY') }}</span>
          <span v-if="person.popularity" class="detail-meta-item"><i class="bi bi-graph-up"></i>Popularity {{ person.popularity.toFixed(0) }}</span>
        </div>
        <div v-if="person.biography" class="person-biography-wrap">
          <p ref="bioElement" class="detail-overview person-biography" :class="{ 'is-collapsed': !bioExpanded }">{{ person.biography }}</p>
          <button v-if="bioNeedsToggle" type="button" class="read-more-link" :aria-expanded="bioExpanded" @click="bioExpanded = !bioExpanded">
            {{ bioExpanded ? 'Read less' : 'Read more' }}
          </button>
        </div>
      </div>
    </div>

    <section v-if="movieCredits.length" class="detail-section">
      <h2 class="section-title h4 mb-4">Filmography — Movies</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="movie in pagedMovieCredits" :key="movie.id" class="col">
          <div class="movie-card" @click="goTo('movie', movie.id)">
            <async-image frame-class="card-img-frame" :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" :alt="movie.title" />
            <p class="description p-2 text-center mb-0 pb-0">{{ movie.title }}</p>
            <div class="p-2 text-center footer">{{ movie.release_date ? movie.release_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
      <pagination-controls :page="moviePage" :page-count="moviePageCount" :can-prev="movieCanPrev" :can-next="movieCanNext" @prev="moviePrevPage" @next="movieNextPage" />
    </section>

    <section v-if="tvCredits.length" class="detail-section">
      <h2 class="section-title h4 mb-4">Filmography — TV Shows</h2>
      <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
        <div v-for="tv in pagedTvCredits" :key="tv.id" class="col">
          <div class="movie-card" @click="goTo('tv', tv.id)">
            <async-image frame-class="card-img-frame" :src="tv.poster_path ? 'https://image.tmdb.org/t/p/w500' + tv.poster_path : ''" :alt="tv.name" />
            <p class="description p-2 text-center mb-0 pb-0">{{ tv.name }}</p>
            <div class="p-2 text-center footer">{{ tv.first_air_date ? tv.first_air_date.slice(0, 4) : '' }}</div>
          </div>
        </div>
      </div>
      <pagination-controls :page="tvPage" :page-count="tvPageCount" :can-prev="tvCanPrev" :can-next="tvCanNext" @prev="tvPrevPage" @next="tvNextPage" />
    </section>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import { usePagination } from '@/composables/usePagination'
import PaginationControls from '../components/PaginationControls.vue'
import AsyncImage from '../components/AsyncImage.vue'

const route = useRoute()
const router = useRouter()

const person = ref({})
const movieCredits = ref([])
const tvCredits = ref([])
const loading = ref(true)
const bioElement = ref(null)
const bioExpanded = ref(false)
const bioNeedsToggle = ref(false)
let bioResizeObserver

async function updateBioOverflow() {
  await nextTick()
  const element = bioElement.value
  if (!element) {
    bioNeedsToggle.value = false
    return
  }
  if (!bioExpanded.value) bioNeedsToggle.value = element.scrollHeight > element.clientHeight + 1
}

const { page: moviePage, pageCount: moviePageCount, pageItems: pagedMovieCredits, canPrev: movieCanPrev, canNext: movieCanNext, nextPage: movieNextPage, prevPage: moviePrevPage, resetPage: resetMoviePage } = usePagination(movieCredits, 12)

const { page: tvPage, pageCount: tvPageCount, pageItems: pagedTvCredits, canPrev: tvCanPrev, canNext: tvCanNext, nextPage: tvNextPage, prevPage: tvPrevPage, resetPage: resetTvPage } = usePagination(tvCredits, 12)

function goTo(media, id) {
  router.push({ path: media, query: { id } })
}

async function load() {
  loading.value = true
  bioExpanded.value = false
  bioNeedsToggle.value = false
  resetMoviePage()
  resetTvPage()
  const id = route.query.id
  try {
    const [d, m, t] = await Promise.all([
      api.getPersonDetails(id),
      api.getPersonMovieCredits(id),
      api.getPersonTvCredits(id)
    ])
    person.value = d.data
    movieCredits.value = (m.data.cast || [])
    tvCredits.value = (t.data.cast || [])
    await updateBioOverflow()
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, load)
onMounted(() => {
  load()
  if (typeof ResizeObserver !== 'undefined') {
    bioResizeObserver = new ResizeObserver(() => updateBioOverflow())
    if (bioElement.value) bioResizeObserver.observe(bioElement.value)
  } else {
    window.addEventListener('resize', updateBioOverflow)
  }
})
watch(bioElement, (element, previousElement) => {
  if (previousElement) bioResizeObserver?.unobserve(previousElement)
  if (element) bioResizeObserver?.observe(element)
  updateBioOverflow()
})
onBeforeUnmount(() => {
  bioResizeObserver?.disconnect()
  window.removeEventListener('resize', updateBioOverflow)
})
</script>
