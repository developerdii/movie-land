<template>
  <div v-if="!loading" class="container-xxl">
    <div class="container-title">
      <div class="mb-2">
        <span class="fw-bold">
          <div class="row">
            <div class="col-md-10">
              <span class="display-4">
                {{ movieTitle }}
              </span>
            </div>
            <div class="col-md-2">
              <rating :value="movieData.vote_average" class="float-end mt-2" style="font-size: 2rem"/>
            </div>
          </div>
        </span>
      </div>
      <div class="container-xxl">
        <div class="row">
          <div class="col-md-5">
            <img :src="'https://image.tmdb.org/t/p/w500'+movieData.poster_path" class="rounded">
          </div>
          <div class="col-md-7">
            <div v-if="selectedTab === Enums.SLIDER">
            <span v-for="tags in movieData.genres" :key="tags.id" class="badge bg-secondary me-1 mb-2">
             <h6 class="mb-0">{{ tags.name }}</h6>
          </span>
              <p class="lead mt-5">
                {{ movieData.overview }}
              </p>
              <p v-if="movieData.tagline" class="mt-5 blockquote-footer fst-italic" style="font-size: 1rem">
                {{ movieData.tagline }}</p>
            </div>
            <div class="column-footer">
              <ul class="nav justify-content-center">
                <li class="nav-item">
                  <a class="nav-link nav-icon" :class="selectedTab === Enums.SLIDER ? 'text-primary' : ''"
                     href="javascript:void(0);" @click="selectViewTab(Enums.SLIDER)">
                    <i class="bi bi-grid-3x3-gap-fill"></i>
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-icon" :class="selectedTab === Enums.LIST ? 'text-primary' : ''"
                     href="javascript:void(0);" @click="selectViewTab(Enums.LIST)">
                    <i class="bi bi-list"></i>
                  </a>
                </li>
              </ul>
              <div class="row">
                <slider v-if="selectedTab === Enums.SLIDER && cast.length">
                  <template #card>
                    <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row,index) in cast"
                         :key="index">
                      <div class="row pe-3 ps-3">
                        <div class="col-md-3 p-1 d-flex" v-for="(person,personIndex) in row" :key="personIndex">
                          <div class="movie-card">
                            <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500'+person.profile_path">
                            <p class="p-2 text-center mb-0 pb-0">
                              {{ person.name }}
                            </p>
                            <div class="p-2 text-center footer" style="min-height: 60px">
                              {{ person.character }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </slider>
                <div v-if="selectedTab === Enums.LIST">
                  <div style="min-height: 60vh">
                    <div class="row border rounded bg-white" style="width: 45rem;" v-for="(person, index) in cast[page]" :key="index">
                      <div class="col-md-2 ps-0">
                        <img class="rounded-start" style="width: 60%;" :src="'https://image.tmdb.org/t/p/w500'+person.profile_path">
                      </div>
                      <div class="col-md-10">
                        <p class="lead"><strong>{{ person.name }}</strong></p>
                        <p class="text-muted">{{ person.character }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="pt-2">
                    <ul class="pagination float-end me-5 mb-0" style="font-size: 1.5rem">
                      <li @click="changePage(true)"><a :class="disableNext ? 'disable-paginate' : ''" href="javascript:void(0);">
                        <i class="bi bi-chevron-right"></i>
                      </a></li>
                    </ul>
                    <ul class="pagination float-start mb-0" style="font-size: 1.5rem">
                      <li @click="changePage(false)"><a :class="disablePrevious ? 'disable-paginate' : ''" href="javascript:void(0);">
                        <i class="bi bi-chevron-left"></i>
                      </a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="recommendations.length" class="row mt-2">
          <movie-slider id="recommendations" :movie-data="recommendations" :show-footer="false"
                        title="Recommendations"></movie-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import Rating from '@/components/Rating.vue'
import Slider from '../components/Slider.vue'
import MovieSlider from '../components/MovieSlider.vue'
import Enums from '../enums'
import { formatDate } from '@/utils/date'
import { chunk } from '@/utils/collection'

const route = useRoute()

const movieData = ref({})
const cast = ref([])
const fullCastData = ref([])
const recommendations = ref([])
const loading = ref(false)
const selectedTab = ref(Enums.SLIDER)
const page = ref(0)

const movieTitle = computed(() =>
  `${movieData.value.title} (${formatDate(movieData.value.release_date, 'YYYY')})`
)

const castViewSize = computed(() => (selectedTab.value === Enums.SLIDER ? 4 : 6))

const disablePrevious = computed(() => page.value <= 0)

const disableNext = computed(() => page.value >= cast.value.length - 1)

async function getData() {
  try {
    const response = await api.getMovieDetails(route.query.id)
    if (response.status === 200) movieData.value = response.data
  } catch (error) {
    console.log(error)
  }
}

async function getCredits() {
  try {
    const response = await api.getMovieCredits(route.query.id)
    if (response.status === 200) {
      fullCastData.value = response.data.cast
      chunkCredits()
    }
  } catch (error) {
    console.log(error)
  }
}

function chunkCredits() {
  cast.value = chunk(fullCastData.value.filter(person => person.profile_path), castViewSize.value)
}

async function getRecommendations() {
  try {
    const response = await api.getRecommendationsMovies(route.query.id)
    if (response.status === 200) recommendations.value = chunk(response.data.results, 6)
  } catch (error) {
    console.log(error)
  }
}

async function loadPage() {
  loading.value = true
  await getData()
  await getCredits()
  await getRecommendations()
  loading.value = false
}

function selectViewTab(id) {
  selectedTab.value = id
  page.value = 0
  chunkCredits()
}

function changePage(isNext) {
  if (isNext) {
    if (disableNext.value) return
    page.value++
  } else {
    if (disablePrevious.value) return
    page.value--
  }
}

watch(
  () => route.query.id,
  () => {
    movieData.value = {}
    cast.value = []
    fullCastData.value = []
    recommendations.value = []
    page.value = 0
    loadPage()
  }
)

onMounted(() => {
  loadPage()
})
</script>

<style lang="scss">
.column-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: auto;
}

.nav-icon {
  color: gray;
}

.active {
  color: red;
}

.disable-paginate {
  color: #6c757d;
  pointer-events: none;
  cursor: default;
}
</style>