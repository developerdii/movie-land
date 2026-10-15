<template>
  <div id="search" ref="rootEl">
    <div class="ml-search-inputwrap" :class="{ 'is-open': open }">
      <label class="visually-hidden" for="ml-search-input">Search movies, TV and people</label>
      <i v-if="!loading" class="bi bi-search ml-search-icon" aria-hidden="true"></i>
      <span v-else class="spinner-border spinner-border-sm ml-search-spinner" role="status" aria-hidden="true"></span>
      <input
        id="ml-search-input"
        v-model="query"
        type="text"
        class="ml-search-input"
        placeholder="Search movies, TV shows, people"
        autocomplete="off"
        role="combobox"
        :aria-expanded="open"
        aria-controls="ml-search-list"
        :aria-activedescendant="open && displayResults.length ? 'ml-search-opt-' + activeIndex : null"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      >
      <button v-if="query" type="button" class="ml-search-clear" aria-label="Clear search" @click="clearQuery">
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>

    <div v-if="open" class="ml-search-panel">
      <div class="ml-search-tabs" role="tablist" aria-label="Result type">
        <button
          v-for="tab in tabs"
          :key="tab.type"
          type="button"
          class="ml-search-tab"
          :class="{ 'is-active': tab.type === activeType }"
          role="tab"
          :aria-selected="tab.type === activeType"
          @click="selectTab(tab.type)"
        >
          <span>{{ tab.label }}</span>
          <span class="ml-search-count">{{ counts[tab.type] }}</span>
        </button>
      </div>

      <div class="ml-search-heading">{{ heading }}</div>

      <div
        v-if="displayResults.length"
        id="ml-search-list"
        class="ml-search-list"
        :class="{ 'is-keyboard': keyboardNav }"
        role="listbox"
        aria-label="Search results"
      >
        <a
          v-for="(item, index) in displayResults"
          :key="item.type + ':' + item.id"
          :id="'ml-search-opt-' + index"
          class="ml-search-item"
          :class="{ 'is-active': index === activeIndex }"
          role="option"
          :aria-selected="index === activeIndex"
          :href="item.href"
          @click.prevent="openItem(item)"
          @mouseenter="onRowHover(index)"
        >
          <span
            v-if="item.isPerson && !item.hasImage"
            class="ml-search-thumb ml-search-thumb--person ml-search-initials"
            aria-hidden="true"
          >{{ item.initials }}</span>
          <async-image
            v-else
            :kind="item.isPerson ? 'person' : 'movie'"
            :src="item.src"
            :alt="item.name"
            :aspect-ratio="item.isPerson ? '1 / 1' : '2 / 3'"
            frame-class="ml-search-thumb"
            :class="item.isPerson ? 'ml-search-thumb--person' : ''"
          />
          <span class="ml-search-item-body">
            <span class="ml-search-item-title">{{ item.pre }}<mark v-if="item.match">{{ item.match }}</mark>{{ item.post }}</span>
            <span v-if="item.badge || item.meta" class="ml-search-item-meta">
              <span v-if="item.badge" class="ml-search-badge">{{ item.badge }}</span>
              <span v-if="item.meta" class="ml-search-meta-text">{{ item.meta }}</span>
            </span>
            <span class="ml-search-item-blurb">{{ item.blurb }}</span>
          </span>
          <i class="bi bi-chevron-right ml-search-chevron" aria-hidden="true"></i>
        </a>
      </div>

      <div v-else class="ml-search-empty">
        <i class="bi bi-search ml-search-empty-icon" aria-hidden="true"></i>
        <span class="ml-search-empty-title">No results for “{{ query.trim() }}”</span>
        <span class="ml-search-empty-sub">Check the spelling or try another tab.</span>
      </div>

      <div class="ml-search-footer">
        <span class="ml-search-hints">
          <span class="ml-search-hint"><span class="ml-search-key">↑ ↓</span><span>to move</span></span>
          <span class="ml-search-hint"><span class="ml-search-key">Enter</span><span>to open</span></span>
          <span class="ml-search-hint"><span class="ml-search-key">Esc</span><span>to close</span></span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import { debounce } from '@/utils/collection'
import AsyncImage from './AsyncImage.vue'

const router = useRouter()

const tabs = [
  { type: 'movie', label: 'Movie' },
  { type: 'tv', label: 'TV' },
  { type: 'person', label: 'Person' }
]

const rootEl = ref(null)
const query = ref('')
const open = ref(false)
const loading = ref(false)
const activeType = ref('movie')
const activeIndex = ref(0)

const results = ref([])
const counts = reactive({ movie: 0, tv: 0, person: 0 })
const trendingCache = reactive({ movie: [], tv: [], person: [] })
const searchCache = reactive({ movie: [], tv: [], person: [] })
const genreMap = ref({})
let genresLoaded = false
const keyboardNav = ref(false)

function filterResults(list, type) {
  return list.filter(item => type === 'person' || item.poster_path !== null)
}

function initialsOf(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

function metaOf(item, type) {
  if (type === 'person') return item.popularity ? 'Popularity ' + item.popularity.toFixed(1) : ''
  const date = type === 'movie' ? item.release_date : item.first_air_date
  return formatDate(date, 'YYYY')
}

function badgeOf(item, type) {
  if (type === 'person') return item.known_for_department || ''
  const genreId = (item.genre_ids || [])[0]
  return genreId ? genreMap.value[genreId] || '' : ''
}

async function ensureGenres() {
  if (genresLoaded) return
  genresLoaded = true
  const [movieRes, tvRes] = await Promise.allSettled([
    api.getMovieGenres(),
    api.getTvGenres()
  ])
  const map = {}
  if (movieRes.status === 'fulfilled') {
    (movieRes.value.data.genres || []).forEach(g => { map[g.id] = g.name })
  }
  if (tvRes.status === 'fulfilled') {
    (tvRes.value.data.genres || []).forEach(g => { map[g.id] = g.name })
  }
  genreMap.value = map
}

function blurbOf(item, type) {
  if (type !== 'person') return item.overview || ''
  const titles = (item.known_for || [])
    .map(k => (k.media_type === 'movie' ? k.title : k.name))
    .filter(Boolean)
  return titles.length ? 'Known for ' + titles.slice(0, 3).join(', ') : ''
}

const displayResults = computed(() => {
  const q = query.value.trim()
  return results.value.map(item => {
    const type = activeType.value
    const name = (type === 'movie' ? item.title : item.name) || ''
    let pre = name
    let match = ''
    let post = ''
    if (q) {
      const idx = name.toLowerCase().indexOf(q.toLowerCase())
      if (idx >= 0) {
        pre = name.slice(0, idx)
        match = name.slice(idx, idx + q.length)
        post = name.slice(idx + q.length)
      }
    }
    const isPerson = type === 'person'
    const imagePath = isPerson ? item.profile_path : item.poster_path
    return {
      id: item.id,
      type,
      name,
      pre,
      match,
      post,
      src: imagePath ? 'https://image.tmdb.org/t/p/w342' + imagePath : '',
      hasImage: !!imagePath,
      initials: initialsOf(name),
      isPerson,
      badge: badgeOf(item, type),
      meta: metaOf(item, type),
      blurb: blurbOf(item, type),
      href: '#/' + type + '?id=' + item.id
    }
  })
})

const heading = computed(() => {
  if (!query.value.trim()) return 'Popular now'
  return counts[activeType.value] + ' ' + activeType.value + ' results'
})

function syncTrendingCounts() {
  counts.movie = trendingCache.movie.length
  counts.tv = trendingCache.tv.length
  counts.person = trendingCache.person.length
}

async function loadTrending() {
  loading.value = true
  const types = ['movie', 'tv', 'person']
  const toFetch = types.filter(t => !trendingCache[t].length)
  if (toFetch.length) {
    const settled = await Promise.allSettled(toFetch.map(t => api.getTrendingMovies(t, 'day')))
    settled.forEach((res, i) => {
      const t = toFetch[i]
      if (res.status === 'fulfilled') {
        trendingCache[t] = filterResults(res.value.data.results || [], t).slice(0, 15)
      }
    })
  }
  if (query.value.trim() !== '') {
    loading.value = false
    return
  }
  syncTrendingCounts()
  results.value = trendingCache[activeType.value]
  loading.value = false
  open.value = true
  activeIndex.value = 0
}

function showTrending() {
  if (trendingCache[activeType.value].length) {
    syncTrendingCounts()
    results.value = trendingCache[activeType.value]
    activeIndex.value = 0
    open.value = true
  } else {
    loadTrending()
  }
}

async function runSearch(q) {
  loading.value = true
  const types = ['movie', 'tv', 'person']
  const settled = await Promise.allSettled(types.map(t => api.getSearch(t, q)))
  settled.forEach((res, i) => {
    const t = types[i]
    if (res.status === 'fulfilled') {
      counts[t] = res.value.data.total_results || 0
      searchCache[t] = filterResults(res.value.data.results || [], t).slice(0, 5)
    } else {
      counts[t] = 0
      searchCache[t] = []
    }
  })
  if (query.value.trim() !== q) return
  results.value = searchCache[activeType.value]
  loading.value = false
  open.value = true
  activeIndex.value = 0
}

const debouncedSearch = debounce(() => {
  const q = query.value.trim()
  if (!q) showTrending()
  else runSearch(q)
}, 250)

function onInput() {
  open.value = true
  activeIndex.value = 0
  if (!query.value.trim()) showTrending()
  else debouncedSearch()
}

function onFocus() {
  open.value = true
  if (!query.value.trim()) {
    if (trendingCache[activeType.value].length) {
      syncTrendingCounts()
      results.value = trendingCache[activeType.value]
      activeIndex.value = 0
    } else {
      loadTrending()
    }
  }
}

function selectTab(type) {
  activeType.value = type
  activeIndex.value = 0
  if (!query.value.trim()) {
    showTrending()
  } else {
    results.value = searchCache[type] || []
    open.value = true
  }
}

function clearQuery() {
  query.value = ''
  activeIndex.value = 0
  showTrending()
}

function openItem(item) {
  router.push({ path: '/' + item.type, query: { id: item.id } })
  closePanel()
}

function closePanel() {
  open.value = false
  activeIndex.value = 0
}

function onRowHover(index) {
  keyboardNav.value = false
  activeIndex.value = index
}

function scrollActiveIntoView() {
  const el = document.getElementById('ml-search-opt-' + activeIndex.value)
  if (el) el.scrollIntoView({ block: 'nearest' })
}

function onKeydown(e) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    keyboardNav.value = true
    if (!open.value) {
      onFocus()
      return
    }
    const n = results.value.length
    if (!n) return
    if (e.key === 'ArrowDown') activeIndex.value = (activeIndex.value + 1) % n
    else activeIndex.value = (activeIndex.value - 1 + n) % n
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    const item = displayResults.value[activeIndex.value]
    if (open.value && item) {
      e.preventDefault()
      openItem(item)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    clearQuery()
    closePanel()
  }
}

function onDocumentPointerDown(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) closePanel()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  ensureGenres()
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>


<style lang="scss">
#search {
  position: relative;
  flex: 0 1 600px;
  max-width: 600px;
  min-width: 0;

  --mls-surface: var(--ml-surface);
  --mls-surface-2: #f1f3f6;
  --mls-surface-3: #f6f7fa;
  --mls-border: var(--ml-line);
  --mls-text: var(--ml-ink);
  --mls-muted: var(--ml-muted);
  --mls-muted-2: #4a5568;
}

#search .ml-search-inputwrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 8px 0 14px;
  background: var(--mls-surface);
  border: 1px solid var(--mls-border);
  border-radius: 12px;
  transition: border-color .15s ease;
}

#search:focus-within .ml-search-inputwrap {
  border-color: var(--ml-brand-accent);
}

#search:focus-within .ml-search-panel {
  border-color: var(--ml-brand-accent);
}

#search .ml-search-inputwrap.is-open {
  border-bottom-color: transparent;
  border-radius: 12px 12px 0 0;
}

#search .ml-search-icon {
  flex: none;
  color: var(--mls-muted);
  font-size: 1.05rem;
}

#search .ml-search-spinner {
  flex: none;
  color: var(--mls-muted);
}

#search .ml-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mls-text);
  font-size: 15px;
  font-weight: 500;
  outline: none;
}

#search .ml-search-input::placeholder {
  color: var(--mls-muted);
}

#search .ml-search-clear {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--mls-muted);
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}

#search .ml-search-clear:hover {
  background: var(--mls-surface-2);
  color: var(--mls-text);
}

#search .ml-search-panel {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 10;
  background: var(--mls-surface);
  border: 1px solid var(--mls-border);
  border-top: 0;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 18px 45px rgba(23, 27, 37, .16);
  overflow: hidden;
}

#search .ml-search-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--mls-border);
}

#search .ml-search-tab {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--mls-muted-2);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}

#search .ml-search-tab:hover:not(.is-active) {
  background: var(--mls-surface-2);
}

#search .ml-search-tab.is-active {
  background: var(--ml-brand-accent);
  color: var(--ml-brand-dark);
}

#search .ml-search-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  box-sizing: border-box;
  border-radius: 999px;
  background: var(--mls-surface-2);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

#search .ml-search-tab.is-active .ml-search-count {
  background: color-mix(in srgb, var(--ml-brand-dark) 16%, transparent);
}

#search .ml-search-heading {
  padding: 14px 16px 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--mls-muted);
}

#search .ml-search-list {
  margin: 0;
  padding: 0 8px 8px;
  list-style: none;
  max-height: 392px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--mls-border) transparent;
}

#search .ml-search-list::-webkit-scrollbar {
  width: 8px;
}

#search .ml-search-list::-webkit-scrollbar-thumb {
  background: var(--mls-border);
  border-radius: 8px;
}

#search .ml-search-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--mls-text);
  font-weight: 400;
  background: transparent;
  transition: background-color .12s ease;
}

#search .ml-search-item.is-active {
  background: var(--mls-surface-2);
}

#search .ml-search-list:not(.is-keyboard) .ml-search-item:hover {
  background: var(--mls-surface-2);
}

#search .ml-search-thumb {
  width: 44px;
  height: 66px;
  flex: none;
  border-radius: 8px;
  background: var(--mls-surface-2);
}

#search .ml-search-thumb.ml-search-thumb--person {
  width: 66px;
  height: 66px;
  border-radius: 50%;
}

#search .ml-search-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--mls-muted);
}

#search .ml-search-thumb .media-image-placeholder {
  background: var(--mls-surface-2);
  color: var(--mls-muted);
  font-size: 1rem;
}

#search .ml-search-item-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

#search .ml-search-item-title {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#search .ml-search-item-title mark {
  background: transparent;
  color: var(--ml-brand-accent);
  padding: 0;
}

#search .ml-search-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mls-muted);
}

#search .ml-search-badge {
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  border: 1px solid var(--mls-border);
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: .06em;
  font-size: 10px;
  font-weight: 700;
  color: var(--mls-muted-2);
}

#search .ml-search-meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#search .ml-search-item-blurb {
  font-size: 13px;
  line-height: 1.45;
  color: var(--mls-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#search .ml-search-chevron {
  flex: none;
  color: transparent;
  font-size: 1rem;
  transition: color .12s ease;
}

#search .ml-search-item.is-active .ml-search-chevron,
#search .ml-search-list:not(.is-keyboard) .ml-search-item:hover .ml-search-chevron {
  color: var(--ml-brand-accent);
}


#search .ml-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 24px 40px;
  text-align: center;
}

#search .ml-search-empty-icon {
  font-size: 1.75rem;
  color: var(--mls-muted);
}

#search .ml-search-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mls-text);
}

#search .ml-search-empty-sub {
  font-size: 13px;
  color: var(--mls-muted);
}

#search .ml-search-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid var(--mls-border);
  background: var(--mls-surface-3);
}

#search .ml-search-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mls-muted);
}

#search .ml-search-hint {
  display: flex;
  align-items: center;
  gap: 6px;
}

#search .ml-search-key {
  padding: 2px 6px;
  border: 1px solid var(--mls-border);
  border-radius: 5px;
  font-variant-numeric: tabular-nums;
}

#search .ml-search-tab:focus-visible,
#search .ml-search-item:focus-visible,
#search .ml-search-clear:focus-visible {
  outline: 2px solid var(--ml-brand-accent);
  outline-offset: 2px;
}

@media (max-width: 639.98px) {
  #search .ml-search-panel {
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 0 0 16px 16px;
  }
}
</style>

