<template>
  <div class="container-xxl detail-page browse-page">
    <browse-filters
      :type="type"
      :state="state"
      :genres="genreOptions"
      :years="years"
      @change="applyChange"
    />

    <media-section
      v-if="items.length"
      :key="type"
      :items="items"
      :kind="type"
      :eyebrow="eyebrow"
      :title="pageTitle"
      server-paged
      :page="state.page"
      :total-pages="totalPages"
      :loading="loading"
      @update:page="goToPage"
    />
    <p v-else-if="loading" class="browse-status" role="status">Loading…</p>
    <div v-else class="browse-status" role="status">
      <i class="bi bi-film" aria-hidden="true"></i>
      <span>{{ failed ? 'Could not load results. Try again.' : 'No results for these filters.' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import BrowseFilters from '@/components/BrowseFilters.vue'
import MediaSection from '@/components/MediaSection.vue'
import {
  MAX_PAGES,
  buildDiscoverParams,
  hasArtwork,
  parseBrowseQuery,
  toBrowseQuery,
  yearOptions
} from '@/utils/browse'
import { getGenreList } from '@/utils/genres'

const route = useRoute()
const router = useRouter()

const PAGE_TITLES = { movie: 'Movies', tv: 'TV Shows', person: 'People' }
const years = yearOptions()

// The URL is the state: everything below is derived from route.params and route.query.
const type = computed(() => route.params.type)
const state = computed(() => parseBrowseQuery(route.query))
const pageTitle = computed(() => PAGE_TITLES[type.value])
const eyebrow = computed(() => (state.value.q ? 'Search · ' + state.value.q : 'Browse'))

const items = ref([])
const totalPages = ref(0)
const loading = ref(false)
const failed = ref(false)

const genres = ref([])
const genreOptions = computed(() => [...genres.value].sort((a, b) => a.name.localeCompare(b.name)))

watch(type, async (next) => {
  items.value = []
  genres.value = []
  if (next === 'person') return
  const list = await getGenreList(next).catch(() => [])
  if (type.value === next) genres.value = list
}, { immediate: true })

// TMDB search ignores genre, year and sort, so a search text switches the list to search results.
function request(current, mediaType) {
  if (current.q) return api.getSearch(mediaType, current.q, current.page)
  if (mediaType === 'person') return api.getPopularPeople(current.page)
  return api.getDiscover(mediaType, buildDiscoverParams(current, mediaType))
}

// Only the latest request may write results, so a slow earlier response cannot overwrite a newer one.
let requestId = 0

async function load() {
  const id = ++requestId
  const current = state.value
  const mediaType = type.value
  loading.value = true
  failed.value = false
  try {
    const { data } = await request(current, mediaType)
    if (id !== requestId) return
    items.value = (data.results || []).filter((item) => hasArtwork(item, mediaType))
    totalPages.value = Math.min(data.total_pages || 0, MAX_PAGES)
    const lastPage = Math.max(totalPages.value, 1)
    if (current.page > lastPage) {
      router.replace({ path: '/browse/' + mediaType, query: toBrowseQuery({ ...current, page: lastPage }) })
    }
  } catch (error) {
    if (id !== requestId) return
    items.value = []
    totalPages.value = 0
    failed.value = true
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(() => route.fullPath, load, { immediate: true })

function applyChange({ type: nextType, ...filters }) {
  if (nextType) {
    if (nextType === type.value) return
    // Genre, year and sort mean different things per media type, so only the search text carries over.
    router.push({ path: '/browse/' + nextType, query: toBrowseQuery(parseBrowseQuery({ q: state.value.q })) })
    return
  }
  // Any filter change starts again from the first page.
  router.push({ path: '/browse/' + type.value, query: toBrowseQuery({ ...state.value, ...filters, page: 1 }) })
}

function goToPage(page) {
  router.push({ path: '/browse/' + type.value, query: toBrowseQuery({ ...state.value, page }) })
}
</script>

<style lang="scss">
.browse-page { padding-top: 2rem; padding-bottom: 3rem; }
.browse-page .detail-section { margin-top: 2rem; }

/* 20 results per TMDB page: 2, 4 or 5 columns always fill the last row. */
.browse-page .cast-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 768px) {
  .browse-page .cast-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (min-width: 1200px) {
  .browse-page .cast-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

.browse-status {
  min-height: 240px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ml-muted);
  font-size: 16px;
  font-weight: 600;
}
.browse-status i { font-size: 1.5rem; }
</style>
