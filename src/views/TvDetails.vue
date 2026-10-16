<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="detail-hero">
      <div class="detail-hero-poster">
        <async-image frame-class="detail-poster" :src="tv.poster_path ? 'https://image.tmdb.org/t/p/w500' + tv.poster_path : ''" :alt="tv.name" />
      </div>
      <div class="detail-hero-content">
        <header class="detail-hero-header">
          <div v-if="tv.genres && tv.genres.length" class="detail-tags">
            <router-link v-for="g in tv.genres" :key="g.id" class="detail-tag" :to="{ path: '/browse/tv', query: { genre: g.id } }">{{ g.name }}</router-link>
          </div>
          <h1 class="detail-title">{{ tv.name }}</h1>
          <div class="detail-meta-row">
            <span v-if="tv.vote_average" class="detail-rating-badge">
              <i class="bi bi-star-fill" aria-hidden="true"></i>
              <span class="detail-rating-value">{{ tv.vote_average.toFixed(1) }}</span>
              <span class="detail-rating-scale">/ 10</span>
            </span>
            <span v-if="tv.episode_run_time && tv.episode_run_time.length" class="detail-meta-item"><i class="bi bi-clock" aria-hidden="true"></i>{{ formatRuntime(tv.episode_run_time[0]) }}</span>
            <span v-if="airDates" class="detail-meta-item"><i class="bi bi-calendar3" aria-hidden="true"></i>{{ airDates }}</span>
            <span v-if="seasonsEpisodes" class="detail-meta-item"><i class="bi bi-collection" aria-hidden="true"></i>{{ seasonsEpisodes }}</span>
            <span v-if="getLanguageName(tv.original_language)" class="detail-meta-item"><i class="bi bi-globe2" aria-hidden="true"></i>{{ getLanguageName(tv.original_language) }}</span>
          </div>
        </header>

        <dl v-if="creators.length || writers.length" class="detail-facts">
          <div v-if="mergedCreatorWriter" class="detail-fact">
            <dt>Creator &amp; Writer</dt>
            <dd>
              <a class="detail-person" :href="`/person?id=${mergedCreatorWriter.id}`" @click.prevent="goTo('person', mergedCreatorWriter.id)">{{ mergedCreatorWriter.name }}</a>
            </dd>
          </div>
          <template v-else>
            <div v-if="creators.length" class="detail-fact">
              <dt>Created by</dt>
              <dd>
                <template v-for="(person, index) in creators" :key="person.id">
                  <a class="detail-person" :href="`/person?id=${person.id}`" @click.prevent="goTo('person', person.id)">{{ person.name }}</a><span v-if="index < creators.length - 1" class="detail-fact-sep">,</span>
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
      <movie-slider id="recommendations-carousel" type="tv" variant="movie" :movie-data="recommendationChunks" :show-arrows="false" :show-position="false" @slid="onRecSlid"></movie-slider>
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

function crewByJobs(jobNames) {
  const map = new Map()
  for (const person of crew.value) {
    const matches = (person.jobs || []).filter((job) => jobNames.includes(job.job))
    if (!matches.length) continue
    const count = Math.max(...matches.map((job) => job.episode_count || 0))
    map.set(person.id, { person, count })
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((entry) => entry.person)
}

const creators = computed(() => (tv.value.created_by || []).filter(c => c.name))
const writers = computed(() => crewByJobs(['Writer', 'Screenplay', 'Story']))
const mergedCreatorWriter = computed(() => {
  if (creators.value.length === 1 && writers.value.length === 1 && creators.value[0].id === writers.value[0].id) {
    return creators.value[0]
  }
  return null
})
const writerLabel = computed(() => (writers.value.length === 1 ? 'Writer' : 'Writers'))
const airDates = computed(() => {
  const first = tv.value.first_air_date ? tv.value.first_air_date.slice(0, 4) : ''
  if (!first) return ''
  const last = tv.value.last_air_date ? tv.value.last_air_date.slice(0, 4) : ''
  const ended = tv.value.status === 'Ended' || tv.value.status === 'Canceled'
  if (ended && last) return first === last ? first : `${first} – ${last}`
  return `${first} – present`
})
const seasonsEpisodes = computed(() => {
  const seasons = tv.value.number_of_seasons
  const episodes = tv.value.number_of_episodes
  if (!seasons && !episodes) return ''
  const s = seasons ? `${seasons} ${seasons === 1 ? 'season' : 'seasons'}` : ''
  const e = episodes ? `${episodes} ${episodes === 1 ? 'episode' : 'episodes'}` : ''
  return [s, e].filter(Boolean).join(' · ')
})

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

async function load() {
  loading.value = true
  const id = route.query.id
  try {
    const [d, c, ag, r] = await Promise.all([
      api.getTvDetails(id),
      api.getTvCredits(id),
      api.getTvAggregateCredits(id),
      api.getTvRecommendations(id)
    ])
    tv.value = d.data
    cast.value = (c.data.cast || [])
    crew.value = ag.data.crew || []
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
