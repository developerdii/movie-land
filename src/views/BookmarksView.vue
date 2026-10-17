<template>
  <div class="container-xxl detail-page browse-page">
    <div class="browse-top">
      <div class="browse-seg" role="group" aria-label="Bookmark type">
        <button
          v-for="tab in TYPE_TABS"
          :key="tab.value"
          type="button"
          class="browse-seg-btn"
          :class="{ active: tab.value === type }"
          :aria-pressed="tab.value === type"
          @click="selectType(tab.value)"
        >
          {{ tab.label }}
          <span class="browse-seg-count">{{ count(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Bookmarks are paged on the device: each page asks TMDB only for its own titles. -->
    <media-section
      v-if="total || loading"
      :key="type"
      :items="items"
      :kind="type"
      eyebrow="Bookmarks"
      :title="pageTitle"
      server-paged
      :page="page"
      :total-pages="totalPages"
      :loading="loading"
      @update:page="goToPage"
    />
    <div v-else class="browse-status" role="status">
      <i class="bi bi-bookmark" aria-hidden="true"></i>
      <span>No bookmarked {{ currentTab.noun }} yet. Open a title and press Bookmark.</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import MediaSection from '@/components/MediaSection.vue'
import { useBookmarks } from '@/composables/useBookmarks'

// 20 per page, like the browse grid: 2, 4 or 5 columns always fill the last row.
const PAGE_SIZE = 20

const TYPE_TABS = [
  { value: 'movie', label: 'Movies', noun: 'movies' },
  { value: 'tv', label: 'TV Shows', noun: 'TV shows' },
  { value: 'person', label: 'People', noun: 'people' }
]

const route = useRoute()
const router = useRouter()
const { ids, count } = useBookmarks()

const type = computed(() => route.params.type)
const currentTab = computed(() => TYPE_TABS.find((entry) => entry.value === type.value) || TYPE_TABS[0])
const pageTitle = computed(() => currentTab.value.label)

// Newest first, as they were bookmarked.
const allIds = computed(() => ids(type.value) || [])
const total = computed(() => allIds.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const requestedPage = computed(() => Math.max(1, parseInt(route.query.page, 10) || 1))
const page = computed(() => Math.min(requestedPage.value, totalPages.value))
const pageIds = computed(() => allIds.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

const items = ref([])
const loading = ref(false)
let requestId = 0

function fetchDetail(mediaType, id) {
  if (mediaType === 'movie') return api.getMovieDetails(id)
  if (mediaType === 'tv') return api.getTvDetails(id)
  return api.getPersonDetails(id)
}

// Keeps only what the poster cards read, in the shape MediaSection already uses.
function toCard(mediaType, data) {
  if (mediaType === 'person') {
    return { id: data.id, name: data.name, profile_path: data.profile_path, known_for_department: data.known_for_department }
  }
  const genreIds = (data.genres || []).map((genre) => genre.id)
  if (mediaType === 'tv') {
    return { id: data.id, name: data.name, poster_path: data.poster_path, first_air_date: data.first_air_date, vote_average: data.vote_average, genre_ids: genreIds }
  }
  return { id: data.id, title: data.title, poster_path: data.poster_path, release_date: data.release_date, vote_average: data.vote_average, genre_ids: genreIds }
}

// Only the latest request writes results, so a slow earlier page cannot overwrite a newer one.
async function load() {
  const id = ++requestId
  const mediaType = type.value
  const list = pageIds.value
  loading.value = true
  const settled = await Promise.allSettled(list.map((entry) => fetchDetail(mediaType, entry)))
  if (id !== requestId) return
  // A title that TMDB no longer returns is left out of the page rather than breaking it.
  items.value = settled.filter((result) => result.status === 'fulfilled').map((result) => toCard(mediaType, result.value.data))
  loading.value = false
}

// A page number past the end (after removing bookmarks) moves to the last page.
watch(() => [requestedPage.value, totalPages.value], () => {
  if (requestedPage.value !== page.value) {
    router.replace({ path: '/bookmarks/' + type.value, query: page.value > 1 ? { page: page.value } : {} })
  }
}, { immediate: true })

watch(() => [type.value, page.value, pageIds.value.join(',')], () => load(), { immediate: true })

function selectType(value) {
  router.push({ path: '/bookmarks/' + value })
}

function goToPage(value) {
  router.push({ path: '/bookmarks/' + type.value, query: value > 1 ? { page: value } : {} })
}
</script>
