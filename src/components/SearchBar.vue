<template>
  <div id="search">
    <button
      type="button"
      class="ml-search-trigger"
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K"
      :aria-expanded="open"
      aria-label="Search movies, TV and people"
      @click="openPanel"
    >
      <i class="bi bi-search ml-search-trigger-icon" aria-hidden="true"></i>
      <span class="ml-search-trigger-hint">Movies, TV &amp; people</span>
    </button>

    <!-- The panel is teleported to body so it can sit in the middle of the screen, above the sticky navbar. -->
    <teleport to="body">
      <transition name="ml-spotlight">
        <div v-if="open" class="ml-spotlight" @pointerdown.self="closePanel">
          <div
            ref="panelEl"
            class="ml-spotlight-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search movies, TV and people"
            @keydown.tab="trapTab"
          >
            <div class="ml-search-inputwrap">
              <label class="visually-hidden" for="ml-search-input">Search movies, TV and people</label>
              <i v-if="!loading" class="bi bi-search ml-search-icon" aria-hidden="true"></i>
              <span v-else class="spinner-border spinner-border-sm ml-search-spinner" role="status" aria-hidden="true"></span>
              <input
                id="ml-search-input"
                ref="inputEl"
                v-model="query"
                type="text"
                class="ml-search-input"
                placeholder="Search movies, TV shows, people"
                autocomplete="off"
                role="combobox"
                :aria-expanded="displayResults.length > 0"
                aria-controls="ml-search-list"
                :aria-activedescendant="displayResults.length ? 'ml-search-opt-' + activeIndex : null"
                @input="onInput"
                @focus="onFocus"
                @keydown="onKeydown"
              >
              <button v-if="query" type="button" class="ml-search-clear" aria-label="Clear search" @click="clearQuery">
                <i class="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>

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
                @focus="onTabFocus(tab.type)"
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
                  <span v-if="item.badge || item.meta || item.rank" class="ml-search-item-meta">
                    <span v-if="item.rank" class="ml-search-rank">#{{ item.rank }}</span>
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
              <a class="ml-search-browse" :href="browseHref" @click.prevent="browseAll">
                <span>Browse all</span>
                <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import { debounce } from '@/utils/collection'
import AsyncImage from './AsyncImage.vue'

const router = useRouter()
const route = useRoute()

const tabs = [
  { type: 'movie', label: 'Movie' },
  { type: 'tv', label: 'TV' },
  { type: 'person', label: 'Person' }
]

const inputEl = ref(null)
const panelEl = ref(null)
const query = ref('')
const open = ref(false)
const loading = ref(false)
const activeType = ref('movie')
const activeIndex = ref(0)

const results = ref([])
const counts = reactive({ movie: 0, tv: 0, person: 0 })
const defaultCache = reactive({ movie: [], tv: [], person: [] })
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
  return results.value.map((item, index) => {
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
      // Rank only means something in the default popularity list, not in search results.
      rank: type === 'person' && !q ? index + 1 : 0,
      blurb: blurbOf(item, type),
      href: '#/' + type + '?id=' + item.id
    }
  })
})

const heading = computed(() => {
  if (!query.value.trim()) return 'Popular now'
  return counts[activeType.value] + ' ' + activeType.value + ' results'
})

function syncDefaultCounts() {
  counts.movie = defaultCache.movie.length
  counts.tv = defaultCache.tv.length
  counts.person = defaultCache.person.length
}

// The default list with no search text is the same popularity order that Browse all opens with.
function fetchDefault(type) {
  if (type === 'person') return api.getPopularPeople()
  if (type === 'tv') return api.getPopularTv()
  return api.getPopularMovies()
}

// Loading never opens or closes the panel: only openPanel and closePanel do that, so a request that
// finishes after Esc cannot bring the panel back.
async function loadDefault() {
  loading.value = true
  const types = ['movie', 'tv', 'person']
  const toFetch = types.filter(t => !defaultCache[t].length)
  if (toFetch.length) {
    const settled = await Promise.allSettled(toFetch.map(t => fetchDefault(t)))
    settled.forEach((res, i) => {
      const t = toFetch[i]
      if (res.status === 'fulfilled') {
        defaultCache[t] = filterResults(res.value.data.results || [], t).slice(0, 15)
      }
    })
  }
  if (query.value.trim() !== '') {
    loading.value = false
    return
  }
  syncDefaultCounts()
  results.value = defaultCache[activeType.value]
  loading.value = false
  activeIndex.value = 0
}

function showDefault() {
  if (defaultCache[activeType.value].length) {
    syncDefaultCounts()
    results.value = defaultCache[activeType.value]
    activeIndex.value = 0
  } else {
    loadDefault()
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
  activeIndex.value = 0
}

const debouncedSearch = debounce(() => {
  const q = query.value.trim()
  if (!q) showDefault()
  else runSearch(q)
}, 250)

function onInput() {
  activeIndex.value = 0
  if (!query.value.trim()) showDefault()
  else debouncedSearch()
}

function onFocus() {
  if (!query.value.trim()) {
    if (defaultCache[activeType.value].length) {
      syncDefaultCounts()
      results.value = defaultCache[activeType.value]
      activeIndex.value = 0
    } else {
      loadDefault()
    }
  }
}

// Tab moves between the result types: focusing a type's tab selects it, so Tab and Shift+Tab switch the results.
function onTabFocus(type) {
  if (type !== activeType.value) selectTab(type)
}

function selectTab(type) {
  activeType.value = type
  activeIndex.value = 0
  if (!query.value.trim()) {
    showDefault()
  } else {
    results.value = searchCache[type] || []
  }
}

function clearQuery() {
  query.value = ''
  activeIndex.value = 0
  showDefault()
  inputEl.value?.focus()
}

// The page behind the panel stays put and does not jump when the scrollbar is hidden.
function setScrollLock(locked) {
  const root = document.documentElement
  if (locked) {
    root.style.paddingRight = window.innerWidth - root.clientWidth + 'px'
    root.classList.add('ml-search-lock')
  } else {
    root.style.paddingRight = ''
    root.classList.remove('ml-search-lock')
  }
}

let returnFocusEl = null

function openPanel() {
  if (open.value) return
  returnFocusEl = document.activeElement
  open.value = true
}

function closePanel() {
  if (!open.value) return
  open.value = false
  activeIndex.value = 0
  if (returnFocusEl && typeof returnFocusEl.focus === 'function') returnFocusEl.focus()
  returnFocusEl = null
}

watch(open, async (isOpen) => {
  setScrollLock(isOpen)
  if (!isOpen) return
  await nextTick()
  // Focusing the input runs onFocus, which loads the popular list when the query is empty.
  inputEl.value?.focus()
})

function openItem(item) {
  router.push({ path: '/' + item.type, query: { id: item.id } })
  closePanel()
}

// Any navigation (Back, a link elsewhere) closes the panel. On the browse page the search box mirrors the
// URL's search text, so it never shows a query the results don't use.
watch(() => route.fullPath, () => {
  closePanel()
  if (route.name === 'Browse') query.value = typeof route.query.q === 'string' ? route.query.q : ''
})

// Browse all keeps the search text (if any) and the active tab, e.g. #/browse/tv?q=dark.
function browseQuery() {
  const q = query.value.trim()
  return q ? { q } : {}
}

const browseHref = computed(() => router.resolve({ path: '/browse/' + activeType.value, query: browseQuery() }).href)

function browseAll() {
  router.push({ path: '/browse/' + activeType.value, query: browseQuery() })
  closePanel()
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
    const n = results.value.length
    if (!n) return
    if (e.key === 'ArrowDown') activeIndex.value = (activeIndex.value + 1) % n
    else activeIndex.value = (activeIndex.value - 1 + n) % n
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    const item = displayResults.value[activeIndex.value]
    if (item) {
      e.preventDefault()
      openItem(item)
    }
  }
}

// Tab stays inside the dialog while it is open.
function trapTab(e) {
  const focusable = [...panelEl.value.querySelectorAll('input, button, a[href]')].filter(el => !el.disabled)
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Cmd/Ctrl+K toggles the panel from anywhere. Esc clears the query first, then closes, like Spotlight.
function onWindowKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (open.value) closePanel()
    // The photo viewer (body.media-viewer-open) is on top of the page, so search stays closed while it is open.
    else if (!document.body.classList.contains('media-viewer-open')) openPanel()
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    if (query.value) clearQuery()
    else closePanel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
  ensureGenres()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
  setScrollLock(false)
})
</script>


<style lang="scss">
/* Navbar trigger: a compact pill that opens the spotlight panel. */
#search {
  flex: 0 1 auto;
  min-width: 0;
}

#search .ml-search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 300px;
  max-width: 100%;
  height: 40px;
  padding: 0 8px 0 14px;
  border: 1px solid var(--ml-control-line);
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-muted);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color .15s ease, color .15s ease;
}
#search .ml-search-trigger:hover,
#search .ml-search-trigger[aria-expanded="true"] { border-color: var(--ml-brand-accent); }
#search .ml-search-trigger:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

#search .ml-search-trigger-icon { flex: none; font-size: 1rem; }

#search .ml-search-trigger-hint {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
}


/* Spotlight panel: teleported to body, centered in the viewport. */
.ml-spotlight {
  --mls-surface: var(--ml-surface);
  --mls-surface-2: var(--ml-chip);
  --mls-surface-3: var(--ml-tint);
  --mls-border: var(--ml-line);
  --mls-text: var(--ml-ink);
  --mls-muted: var(--ml-muted);
  --mls-muted-2: var(--ml-text-2);

  position: fixed;
  inset: 0;
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(var(--ml-brand-dark-rgb), .5);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.ml-spotlight-enter-active,
.ml-spotlight-leave-active { transition: opacity .18s ease; }
.ml-spotlight-enter-from,
.ml-spotlight-leave-to { opacity: 0; }

.ml-spotlight-enter-active .ml-spotlight-panel { animation: ml-spotlight-in .24s cubic-bezier(.2, .8, .2, 1); }
.ml-spotlight-leave-active .ml-spotlight-panel { animation: ml-spotlight-out .16s ease-in forwards; }

@keyframes ml-spotlight-in {
  from { opacity: 0; transform: translateY(-10px) scale(.97); }
  to { opacity: 1; transform: none; }
}
@keyframes ml-spotlight-out {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateY(-6px) scale(.98); }
}

.ml-spotlight-panel {
  width: min(640px, 100%);
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--mls-border);
  border-radius: 20px;
  background: var(--mls-surface);
  box-shadow: 0 30px 80px rgba(var(--ml-brand-dark-rgb), .35);
}

.ml-spotlight .ml-search-inputwrap {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 12px 0 20px;
  border-bottom: 1px solid var(--mls-border);
}

.ml-spotlight .ml-search-icon {
  flex: none;
  color: var(--mls-muted);
  font-size: 1.15rem;
}

.ml-spotlight .ml-search-spinner {
  flex: none;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--mls-text);
  font-size: 18px;
  font-weight: 500;
  outline: none;
}

.ml-spotlight .ml-search-input::placeholder {
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-clear {
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

.ml-spotlight .ml-search-clear:hover {
  background: var(--mls-surface-2);
  color: var(--mls-text);
}

.ml-spotlight .ml-search-tabs {
  flex: none;
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--mls-border);
}

.ml-spotlight .ml-search-tab {
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
  color: var(--ml-text-2);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}

.ml-spotlight .ml-search-tab:hover:not(.is-active) {
  background: var(--mls-surface-2);
}

.ml-spotlight .ml-search-tab.is-active {
  background: var(--ml-brand-accent);
  color: var(--ml-brand-dark);
}

.ml-spotlight .ml-search-count {
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

.ml-spotlight .ml-search-tab.is-active .ml-search-count {
  background: color-mix(in srgb, var(--ml-brand-dark) 16%, transparent);
}

.ml-spotlight .ml-search-heading {
  flex: none;
  padding: 14px 16px 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-list {
  flex: 0 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0 8px 8px;
  list-style: none;
  max-height: min(440px, 52vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--mls-border) transparent;
}

.ml-spotlight .ml-search-list::-webkit-scrollbar {
  width: 8px;
}

.ml-spotlight .ml-search-list::-webkit-scrollbar-thumb {
  background: var(--mls-border);
  border-radius: 8px;
}

.ml-spotlight .ml-search-item {
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

.ml-spotlight .ml-search-item.is-active {
  background: var(--mls-surface-2);
}

.ml-spotlight .ml-search-list:not(.is-keyboard) .ml-search-item:hover {
  background: var(--mls-surface-2);
}

.ml-spotlight .ml-search-thumb {
  width: 44px;
  height: 66px;
  flex: none;
  border-radius: 8px;
  background: var(--mls-surface-2);
}

.ml-spotlight .ml-search-thumb.ml-search-thumb--person {
  width: 66px;
  height: 66px;
  border-radius: 50%;
}

.ml-spotlight .ml-search-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-thumb .media-image-placeholder {
  background: var(--mls-surface-2);
  color: var(--mls-muted);
  font-size: 1rem;
}

.ml-spotlight .ml-search-item-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ml-spotlight .ml-search-item-title {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ml-spotlight .ml-search-item-title mark {
  background: transparent;
  color: var(--ml-brand-accent);
  padding: 0;
}

.ml-spotlight .ml-search-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-badge {
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

.ml-spotlight .ml-search-rank {
  flex: none;
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  background: rgba(var(--ml-brand-accent-rgb), .18);
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--ml-ink);
}

.ml-spotlight .ml-search-meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ml-spotlight .ml-search-item-blurb {
  font-size: 13px;
  line-height: 1.45;
  color: var(--mls-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ml-spotlight .ml-search-chevron {
  flex: none;
  color: transparent;
  font-size: 1rem;
  transition: color .12s ease;
}

.ml-spotlight .ml-search-item.is-active .ml-search-chevron,
.ml-spotlight .ml-search-list:not(.is-keyboard) .ml-search-item:hover .ml-search-chevron {
  color: var(--ml-brand-accent);
}

.ml-spotlight .ml-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 24px 40px;
  text-align: center;
}

.ml-spotlight .ml-search-empty-icon {
  font-size: 1.75rem;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mls-text);
}

.ml-spotlight .ml-search-empty-sub {
  font-size: 13px;
  color: var(--mls-muted);
}

.ml-spotlight .ml-search-footer {
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid var(--mls-border);
  background: var(--mls-surface-3);
}

.ml-spotlight .ml-search-browse {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: var(--mls-text);
  text-decoration: none;
  transition: color .15s ease;
}

.ml-spotlight .ml-search-browse i {
  color: var(--ml-brand-accent);
  transition: transform .15s ease;
}

.ml-spotlight .ml-search-browse:hover { color: var(--ml-brand-accent); }
.ml-spotlight .ml-search-browse:hover i { transform: translateX(3px); }
.ml-spotlight .ml-search-browse:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 3px; border-radius: 6px; }

.ml-spotlight .ml-search-tab:focus-visible,
.ml-spotlight .ml-search-item:focus-visible,
.ml-spotlight .ml-search-clear:focus-visible {
  outline: 2px solid var(--ml-brand-accent);
  outline-offset: 2px;
}

/* The field itself has no outline: the gold focus shows on the row through the caret and icon. */
.ml-spotlight .ml-search-input:focus,
.ml-spotlight .ml-search-input:focus-visible { outline: none; }

html.ml-search-lock { overflow: hidden; }

@media (prefers-reduced-motion: reduce) {
  .ml-spotlight-enter-active .ml-spotlight-panel,
  .ml-spotlight-leave-active .ml-spotlight-panel { animation: none; }
}

/* Below 992 px the navbar holds the logo, Home, Browse and the icon buttons, so the field shrinks to its icon. */
@media (max-width: 991.98px) {
  #search .ml-search-trigger { width: 40px; justify-content: center; padding: 0; }
  #search .ml-search-trigger-hint { display: none; }
}

/* Phones: the navbar keeps only the icon, and the panel sits at the top so the keyboard never covers the field. */
@media (max-width: 575.98px) {
  #search .ml-search-trigger {
    width: 40px;
    justify-content: center;
    padding: 0;
  }

  .ml-spotlight {
    align-items: flex-start;
    padding: 12px;
    padding-top: max(12px, env(safe-area-inset-top));
  }
  .ml-spotlight-panel {
    max-height: calc(100vh - 24px);
    max-height: calc(100dvh - 24px);
    border-radius: 18px;
  }
  .ml-spotlight .ml-search-inputwrap { height: 60px; padding-left: 16px; }
  /* 16px stops iOS from zooming the page when the field is focused. */
  .ml-spotlight .ml-search-input { font-size: 16px; }
  .ml-spotlight .ml-search-list { max-height: min(440px, 58vh); }
  .ml-spotlight .ml-search-item { padding: 8px; gap: 12px; }
  .ml-spotlight .ml-search-thumb { width: 40px; height: 60px; }
  .ml-spotlight .ml-search-thumb.ml-search-thumb--person { width: 60px; height: 60px; }
}

@media (max-width: 639.98px) {
  .ml-spotlight .ml-search-tab { font-size: 13px; }
}
</style>
