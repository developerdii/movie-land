<template>
  <div id="search">
    <div class="d-flex align-items-center small">
      <i v-if="!loading" class="bi bi-search text-muted position-absolute ps-3"></i>
      <span v-else class="spinner-border spinner-border-sm text-muted position-absolute ms-3" role="status" aria-hidden="true"></span>
      <input type="text" v-model="searchText" @click="getList" @keyup="debounceInput" class="form-control border-0 ps-5"
             placeholder="Search..."/>

    </div>
    <div v-if="isShownSearchList" id="search-list" class="list-group position-fixed me-2 mt-1 bg-light shadow-sm"
         style="right: 0; overflow-y: auto; max-height: 92vh">
      <nav id="search-nav-bar" class="nav nav-pills sticky-top bg-light shadow-sm flex-column flex-sm-row">
        <a v-for="media in mediaTypes" :key="media.id" class="flex-sm-fill text-sm-center nav-link shadow m-1"
           :class="defaultMediaType.id === media.id ? 'active' : ''" aria-current="page"
           @click="selectMediaType(media)">
          {{ media.text }}</a>
      </nav>
      <a href="javascript:void(0)" @click="route(item.media_type || defaultMediaType.type,item.id)" v-for="item in searchList" :key="item.id"
         class="list-group-item list-group-item-action flex-column align-items-start">
        <div v-if="item.media_type === 'movie' || defaultMediaType.type === 'movie'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.title }}</h5>
            <small>{{ formatDate(item.release_date, 'YYYY') }}</small>
          </div>
          <div class="row mt-1" style="width: 40rem">
            <div class="col-md-2 pe-0">
              <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.poster_path">
            </div>
            <div class="col-md-10 ps-0">
              <small class="search-list-description"> {{ item.overview }}</small>
            </div>
          </div>
        </div>
        <div v-if="item.media_type === 'tv' || defaultMediaType.type === 'tv'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>{{ formatDate(item.first_air_date, 'YYYY') }}</small>
          </div>
          <div class="row mt-1" style="width: 40rem">
            <div class="col-md-2 pe-0">
              <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.poster_path">
            </div>
            <div class="col-md-10 ps-0">
              <small class="search-list-description"> {{ item.overview }}</small>
            </div>
          </div>
        </div>
        <div v-if="item.media_type === 'person' || defaultMediaType.type === 'person'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>Popularity: <span class="text-info">{{ item.popularity }}</span></small>
          </div>
          <div class="row mt-1" style="width: 40rem">
            <div class="col-md-2 pe-0">
              <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.profile_path">
            </div>
            <div class="col-md-10 ps-0">
              <p v-for="(movie,index) in item.known_for" :key="index" class="fw-light m-1">
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
        <div class="row mt-1" style="width: 40rem">
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
/* width */
#search-list::-webkit-scrollbar {
  width: 10px;
}

/* Track */
#search-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
#search-list::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
#search-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
#search input {
  //border-radius: 2rem;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px 0 inset;
}

.search-list-description {
  overflow: hidden;
  display: -webkit-box;
  /*-webkit-line-clamp: 5;*/
  -webkit-box-orient: vertical;
}
</style>
