<template>
  <div class="container-xxl detail-page browse-page">
    <div class="browse-top">
      <div class="browse-seg" role="group" aria-label="Media type">
        <button
          v-for="tab in TYPE_TABS"
          :key="tab.value"
          type="button"
          class="browse-seg-btn"
          :class="{ active: tab.value === type }"
          :aria-pressed="tab.value === type"
          :disabled="loading"
        @click="applyChange({ type: tab.value })"
        >{{ tab.label }}</button>
      </div>

      <!-- Search is its own TMDB endpoint, so it sits beside the tabs and not in the filter bar. -->
      <browse-search :q="state.q" :type="type" @change="applyChange" />
    </div>

    <browse-filters
      v-if="type !== 'person'"
      :state="state"
      :genres="genreOptions"
      :years="years"
      :languages="languages"
      :countries="countries"
      :loading="loading"
      @change="applyChange"
    />

    <!-- While loading, MediaSection shows skeleton cards, including on the first load when there are no items yet. -->
    <media-section
      v-if="items.length || loading"
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
import BrowseSearch from '@/components/BrowseSearch.vue'
import MediaSection from '@/components/MediaSection.vue'
import {
  MAX_PAGES,
  buildDiscoverParams,
  parseBrowseQuery,
  toBrowseQuery,
  yearOptions
} from '@/utils/browse'
import { getCountryList, getLanguageList } from '@/utils/configuration'
import { getGenreList } from '@/utils/genres'

const route = useRoute()
const router = useRouter()

const TYPE_TABS = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
  { value: 'person', label: 'People' }
]
const years = yearOptions()

// The URL is the state: everything below is derived from route.params and route.query.
const type = computed(() => route.params.type)
const state = computed(() => parseBrowseQuery(route.query))
const pageTitle = computed(() => TYPE_TABS.find((tab) => tab.value === type.value).label)
const eyebrow = computed(() => (state.value.q ? 'Search · ' + state.value.q : 'Browse'))

const items = ref([])
const totalPages = ref(0)
const loading = ref(false)
const failed = ref(false)

const genres = ref([])
const genreOptions = computed(() => [...genres.value].sort((a, b) => a.name.localeCompare(b.name)))

// Language and country lists are static, so they load once per session; empty lists just leave "Any" selected.
const languages = ref([])
const countries = ref([])
getLanguageList().then((list) => { languages.value = list }).catch(() => {})
getCountryList().then((list) => { countries.value = list }).catch(() => {})

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
    // Keep items without a poster: PosterCard shows an initials placeholder, so each TMDB page stays full.
    items.value = data.results || []
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
  const next = { path: '/browse/' + type.value, query: toBrowseQuery({ ...state.value, ...filters, page: 1 }) }
  // Search-field updates replace the current entry, so Back does not step through every pause while typing.
  if (Object.keys(filters).length === 1 && 'q' in filters) router.replace(next)
  else router.push(next)
}

function goToPage(page) {
  router.push({ path: '/browse/' + type.value, query: toBrowseQuery({ ...state.value, page }) })
}
</script>

<style lang="scss">
.browse-page { padding-top: 2rem; padding-bottom: 3rem; }
.browse-page .detail-section { margin-top: 2rem; }

/* Top row: media type tabs and the search field. Switching type is not a filter. */
.browse-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.browse-seg { display: flex; width: fit-content; max-width: 100%; gap: 4px; padding: 4px; background: #f4f5f7; border: 1px solid #d9dde3; border-radius: 999px; }
.browse-seg-btn {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #4a5568;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.browse-seg-btn:hover:not(.active) { color: var(--ml-brand-dark); }
.browse-seg-btn.active { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }
.browse-seg-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
.browse-seg-btn:disabled { opacity: .5; cursor: not-allowed; }

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
