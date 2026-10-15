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

    <media-section v-if="movieCredits.length" kind="movie" eyebrow="Filmography" title="Movies" :items="movieCredits" />

    <media-section v-if="tvCredits.length" kind="tv" eyebrow="Filmography" title="TV Shows" :items="tvCredits" />
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import AsyncImage from '../components/AsyncImage.vue'
import MediaSection from '../components/MediaSection.vue'

const route = useRoute()

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

async function load() {
  loading.value = true
  bioExpanded.value = false
  bioNeedsToggle.value = false
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
