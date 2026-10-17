<template>
  <div v-if="!loading" class="detail-page">
    <div class="page-card">
      <div class="detail-hero">
        <div class="detail-hero-poster">
          <button type="button" class="detail-poster-btn" aria-label="View posters" @click="openPosters">
            <async-image frame-class="detail-poster" :src="movieData.poster_path ? 'https://image.tmdb.org/t/p/w500' + movieData.poster_path : ''" :alt="movieData.title" />
          </button>
        </div>
        <div class="detail-hero-content">
          <header class="detail-hero-header">
            <div v-if="movieData.genres && movieData.genres.length" class="detail-tags">
              <router-link v-for="g in movieData.genres" :key="g.id" class="detail-tag" :to="{ path: '/browse/movie', query: { genre: g.id } }">{{ g.name }}</router-link>
            </div>
            <h1 class="detail-title">{{ movieData.title }}</h1>
            <p v-if="originalTitle" class="detail-original-title">Original title: <span :lang="movieData.original_language">{{ originalTitle }}</span></p>
            <score-summary :score="movieData.vote_average || 0" :votes="movieData.vote_count || 0" :facts="summaryFacts" :extras="summaryExtras"></score-summary>
            <bookmark-button v-if="movieData.id" type="movie" :id="movieData.id"></bookmark-button>
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

      <media-strip v-if="imagesLoading || images.backdrops.length" :items="images.backdrops" :loading="imagesLoading" @open="openViewer('backdrops', $event)" />
    </div>

    <media-section v-if="cast.length" :items="cast" />

    <section v-if="recommendations.length" class="detail-section">
      <section-heading eyebrow="More Like This" title="Recommended Movies">
        <template #actions>
          <round-pagination :page="recIndex" :page-count="recTotal" @update:page="goToRec" />
        </template>
      </section-heading>
      <movie-slider ref="recSlider" id="recommendations-carousel" variant="movie" :movie-data="recommendationChunks" :show-arrows="false" :show-position="false" @slid="onRecSlid"></movie-slider>
    </section>

    <media-viewer
      v-if="viewer.open"
      :groups="viewerGroups"
      :start-group="viewer.group"
      :start-index="viewer.index"
      :background="backdropUrl"
      label="Movie photos"
      @close="viewer.open = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import MovieSlider from '../components/MovieSlider.vue'
import MediaSection from '../components/MediaSection.vue'
import SectionHeading from '../components/SectionHeading.vue'
import RoundPagination from '../components/RoundPagination.vue'
import { formatDate } from '@/utils/date'
import { chunk, trimToChunks } from '@/utils/collection'
import { getLanguageName } from '@/utils/language'
import { movieCertification, tvRating } from '@/utils/ratings'
import ScoreSummary from '../components/ScoreSummary.vue'
import BookmarkButton from '../components/BookmarkButton.vue'
import AsyncImage from '../components/AsyncImage.vue'
import MediaStrip from '../components/MediaStrip.vue'
import MediaViewer from '../components/MediaViewer.vue'
import { recordVisit } from '@/composables/useRecent'
import { imageUrl, sortImages, toViewerItems } from '@/utils/images'

const route = useRoute()
const router = useRouter()

const movieData = ref({})
const images = ref({ backdrops: [], posters: [], logos: [] })
const imagesLoading = ref(false)
const viewer = reactive({ open: false, group: 'backdrops', index: 0 })

const backdropUrl = computed(() => imageUrl(movieData.value.backdrop_path, 'w1280'))
// The clicked poster always appears: it opens on the same file in TMDB's list, or stands alone if TMDB has none.
const posterItems = computed(() => {
  if (images.value.posters.length) return images.value.posters
  return movieData.value.poster_path ? [{ path: movieData.value.poster_path, caption: '' }] : []
})

function openPosters() {
  const index = posterItems.value.findIndex((poster) => poster.path === movieData.value.poster_path)
  openViewer('posters', Math.max(index, 0))
}

const viewerGroups = computed(() => [
  { key: 'backdrops', label: 'Backdrops', size: 'w1280', items: images.value.backdrops },
  { key: 'posters', label: 'Posters', size: 'w780', items: posterItems.value },
  { key: 'logos', label: 'Logos', size: 'w500', items: images.value.logos }
])

function openViewer(group, index = 0) {
  viewer.group = group
  viewer.index = index
  viewer.open = true
}

// Photos are not needed to render the page, so they load in the background and never block it.
async function loadImages(id) {
  imagesLoading.value = true
  try {
    const { data } = await api.getMovieImages(id)
    images.value = {
      backdrops: toViewerItems(sortImages(data.backdrops)),
      posters: toViewerItems(sortImages(data.posters)),
      logos: toViewerItems(sortImages(data.logos))
    }
  } catch (e) {
    images.value = { backdrops: [], posters: [], logos: [] }
  } finally {
    imagesLoading.value = false
  }
}
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

const recSlider = ref(null)

// The page control is 1-based; the carousel is 0-based.
function goToRec(page) {
  recSlider.value?.goTo(page - 1)
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

// Shown under the title only when it differs from it, so a film with the same title is not repeated.
const originalTitle = computed(() => {
  const original = (movieData.value.original_title || '').trim()
  return original && original.toLowerCase() !== (movieData.value.title || '').trim().toLowerCase() ? original : ''
})

// Facts beside the score: release date (the emphasised line), runtime, and the language when it is not English.
const summaryFacts = computed(() => [
  movieData.value.release_date ? formatDate(movieData.value.release_date, 'MMM D, YYYY') : '',
  movieData.value.runtime ? formatRuntime(movieData.value.runtime) : '',
  getLanguageName(movieData.value.original_language)
].filter(Boolean))

// The US age rating, and for shows the network, shown as extra sections on the score block.
const summaryExtras = computed(() => {
  const rating = movieCertification(movieData.value.release_dates)
  return rating ? [[{ value: rating, badge: true }]] : []
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

async function loadPage() {
  loading.value = true
  images.value = { backdrops: [], posters: [], logos: [] }
  try {
    const [d, c, r] = await Promise.all([
      api.getMovieDetails(route.query.id),
      api.getMovieCredits(route.query.id),
      api.getRecommendationsMovies(route.query.id)
    ])
    movieData.value = d.data
    recordVisit('movie', d.data.id)
    cast.value = (c.data.cast || [])
    crew.value = c.data.crew || []
    recommendations.value = trimToChunks(r.data.results || [])
    loadImages(route.query.id)
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, loadPage)
onMounted(loadPage)
</script>
