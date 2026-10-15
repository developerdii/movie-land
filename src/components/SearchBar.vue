<template>
  <div id="search">
    <div class="d-flex align-items-center small">
      <i v-if="!loading" class="bi bi-search text-muted position-absolute ps-3"></i>
      <span v-else class="spinner-border spinner-border-sm text-muted position-absolute ms-3" role="status" aria-hidden="true"></span>
      <input type="text" v-model="searchText" @click="getList" @keyup="debounceInput" class="form-control border-0 ps-5"
             placeholder="Search..."/>

    </div>
    <div v-if="isShownSearchList" id="search-list" class="search-panel list-group position-fixed mt-2 bg-light shadow-sm">
      <nav id="search-nav-bar" class="nav nav-pills sticky-top bg-light flex-column flex-sm-row search-tabs">
        <a v-for="media in mediaTypes" :key="media.id" class="flex-sm-fill text-sm-center nav-link m-1"
           :class="defaultMediaType.id === media.id ? 'active' : ''" aria-current="page"
           @click="selectMediaType(media)">
          {{ media.text }}</a>
      </nav>
      <a href="javascript:void(0)" @click="route(item.media_type || defaultMediaType.type,item.id)" v-for="item in searchList" :key="item.id"
         class="list-group-item list-group-item-action flex-column align-items-start search-result">
        <div v-if="item.media_type === 'movie' || defaultMediaType.type === 'movie'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.title }}</h5>
            <small>{{ formatDate(item.release_date, 'YYYY') }}</small>
          </div>
          <div class="search-result-body">
            <img class="search-result-image" :src="'https://image.tmdb.org/t/p/w342'+item.poster_path" :alt="item.title">
            <p class="search-list-description mb-0">{{ item.overview || 'No overview available.' }}</p>
          </div>
        </div>
        <div v-if="item.media_type === 'tv' || defaultMediaType.type === 'tv'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>{{ formatDate(item.first_air_date, 'YYYY') }}</small>
          </div>
          <div class="search-result-body">
            <img class="search-result-image" :src="'https://image.tmdb.org/t/p/w342'+item.poster_path" :alt="item.name">
            <p class="search-list-description mb-0">{{ item.overview || 'No overview available.' }}</p>
          </div>
        </div>
        <div v-if="item.media_type === 'person' || defaultMediaType.type === 'person'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>Popularity: <span class="fw-semibold" style="color: var(--ml-brand-accent)">{{ item.popularity }}</span></small>
          </div>
          <div class="search-result-body">
            <img class="search-result-image" :src="'https://image.tmdb.org/t/p/w342'+item.profile_path" :alt="item.name">
            <div class="search-result-copy">
              <p v-for="(movie,index) in item.known_for" :key="index" class="known-for-item mb-1">
                <template v-if="movie.title">
                  <a class="fw-light" href="javascript:void(0);" @click="route('movie', movie.id)">{{ movie.title + ' - ' }}</a>
                  <i class="bi bi-star-fill" style="color: orange"></i> {{ movie.vote_average }}
                </template>
              </p>
            </div>
          </div>
        </div>
      </a>
      <div v-if="searchList.length === 0" style="padding: 2rem 3rem;">
        <div class="w-100 text-center">
          <h5 class="p-10 m-10">{{ 'Nothing Found' }}</h5>
        </div>
        <div class="row mt-1 search-result-body">
          <div class="col-md-10 ps-0">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import { debounce } from '@/utils/collection'

const router = useRouter()

const searchText = ref('')
const searchList = ref([])
const defaultMediaType = reactive({ id: 1, type: 'movie', text: 'Movie' })
const mediaTypes = [
  { id: 1, type: 'movie', text: 'Movie' },
  { id: 2, type: 'tv', text: 'TV' },
  { id: 3, type: 'person', text: 'Person' }
]
const trendingData = reactive({ movie: [], tv: [], person: [] })
const isShownSearchList = ref(false)
const loading = ref(false)
const searchValue = reactive({
  movie: { name: null, data: null },
  tv: { name: null, data: null },
  person: { name: null, data: null }
})

function filterResults(results) {
  return results.filter(item =>
    defaultMediaType.id === 3 ? item.profile_path !== null : item.poster_path !== null
  )
}

async function getTrendingData() {
  loading.value = true

  if (trendingData[defaultMediaType.type].length > 0) {
    searchList.value = trendingData[defaultMediaType.type]
    loading.value = false
    isShownSearchList.value = true
    return
  }

  try {
    const response = await api.getTrendingMovies(defaultMediaType.type, 'day')
    searchList.value = filterResults(response.data.results).slice(0, 15)
    trendingData[defaultMediaType.type] = searchList.value
    isShownSearchList.value = true
    loading.value = false
  } catch (error) {
    loading.value = false
    isShownSearchList.value = false
    throw error.message
  }
}

function selectMediaType(media) {
  Object.assign(defaultMediaType, media)
  isShownSearchList.value = false
  getList()
}

function getList() {
  if (searchText.value.length > 2) search()
  else getTrendingData()
}

async function search() {
  if (searchText.value.length < 3) return

  if (searchValue[defaultMediaType.type].name === `${defaultMediaType.type}-${searchText.value}`) {
    searchList.value = searchValue[defaultMediaType.type].data
    isShownSearchList.value = true
    return
  }

  loading.value = true
  try {
    const response = await api.getSearch(defaultMediaType.type, searchText.value)
    searchList.value = filterResults(response.data.results).slice(0, 5)
    searchValue[defaultMediaType.type].name = `${defaultMediaType.type}-${searchText.value}`
    searchValue[defaultMediaType.type].data = searchList.value
    isShownSearchList.value = true
    loading.value = false
  } catch (error) {
    loading.value = false
    isShownSearchList.value = false
    throw error.message
  }
}

const debounceInput = debounce(search, 350)

function hideList(event) {
  const listElement = document.getElementById('search-list')
  const searchBox = document.querySelector('#search input')
  const searchNavBar = document.querySelector('#search-nav-bar')
  if (event.target !== searchBox && event.target !== listElement && event.target.parentElement !== searchNavBar) {
    isShownSearchList.value = false
  }
}

function route(media, id) {
  router.push({ path: media, query: { id } })
}

watch(searchText, value => {
  if (value === '') getTrendingData()
})

onMounted(() => {
  document.addEventListener('click', hideList)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', hideList)
})
</script>
<style lang="scss">
#search-list { z-index: 1040; top: 4.5rem; right: max(1rem, calc((100vw - 1320px) / 2)); width: min(760px, calc(100vw - 2rem)); max-height: min(76vh, 760px); overflow-y: auto; border: 1px solid #e4e8ef; border-radius: 14px; }
.search-tabs { z-index: 2; padding: .45rem; border-bottom: 1px solid #e7e9ef; }
.search-tabs .nav-link { color: #344254; font-weight: 700; border-radius: 9px; }
#search-list .nav-pills .nav-link.active { background: var(--ml-gold); color: #171b25; }
.search-result { padding: .9rem 1rem; color: var(--ml-navy); }
.search-result h5 { font-size: 1.05rem; font-weight: 700; margin: 0; }
.search-result > div > .d-flex { align-items: baseline; gap: 1rem; }
.search-result > div > .d-flex small { flex: 0 0 auto; color: #737d8a; }
.search-result-body { display: flex; align-items: flex-start; gap: .9rem; width: 100%; margin-top: .65rem; }
.search-result-image { display: block; width: 68px; height: 100px; object-fit: cover; border-radius: 7px; flex: 0 0 68px; background: #e9edf2; }
.search-list-description { flex: 1; min-width: 0; color: #596273; line-height: 1.5; font-size: .9rem; font-weight: 400; }
.search-result-copy { min-width: 0; flex: 1; font-size: .9rem; }
.known-for-item { color: #596273; }
.known-for-item a { color: var(--ml-brand-dark); text-decoration: none; }
.known-for-item a:hover { text-decoration: underline; }
#search-list::-webkit-scrollbar { width: 9px; }
#search-list::-webkit-scrollbar-thumb { background: #c5cad2; border-radius: 8px; border: 2px solid #f8f9fb; }
#search input {
  //border-radius: 2rem;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px 0 inset;
}

.search-list-description { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }
@media (max-width: 575.98px) { #search-list { top: 4.1rem; right: .5rem; width: calc(100vw - 1rem); max-height: 78vh; } .search-result { padding: .8rem; } .search-result-image { width: 58px; height: 86px; flex-basis: 58px; } .search-list-description, .search-result-copy { font-size: .82rem; } }
</style>
