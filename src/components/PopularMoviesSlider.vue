<template>
  <div id="carouselExampleIndicators" ref="carouselEl" class="carousel slide carousel-fade"
       @mouseenter="hoverCarousel" @mouseleave="unHoverCarousel">
    <div class="carousel-indicators">
      <button v-for="(movie,index) in popularMovies" :key="index" type="button"
              data-bs-target="#carouselExampleIndicators" :data-bs-slide-to="index" :class="index === 0 ? 'active' : ''"
              :aria-label="'Slide '+(index+1)"></button>
    </div>
    <div class="carousel-inner">
      <div class="carousel-item" :class="index === 0 ? 'active' : ''"
           v-for="(movie,index) in popularMovies" :key="index">
        <img :src="'https://image.tmdb.org/t/p/original/'+movie.backdrop_path" class="d-block popular-movie-img"
             :class="isShownDescription ? 'blurred' : ''" :alt="movie.title">
        <div class="caption d-none d-md-block hide">
          <span v-if="!isShownDescription" class="title">{{ movie.title }}</span>
          <p class="description m-1" v-show="!isShownDescription">
            {{ movie.overview }}
          </p>
          <transition name="description">
            <div class="popular-movie-card" v-if="isShownDescription">
              <img class="poster-thumb" :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path" :alt="movie.title">
              <div>
                <h3 class="hover-title mb-1">{{ movie.title }}</h3>
                <rating :value="movie.vote_average"></rating>
                <router-link class="btn btn-gold mt-3" :to="{ path: 'movie', query: { id: movie.id } }">
                  <i class="bi bi-play-fill me-1"></i>View Details
                </router-link>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators"
            data-bs-slide="prev">
      <span class="carousel-control-prev-icon p-3" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators"
            data-bs-slide="next">
      <span class="carousel-control-next-icon p-3" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api'
import Rating from '@/components/Rating.vue'
import { Carousel } from 'bootstrap'

const popularMovies = ref([])
const isShownDescription = ref(false)
const carouselEl = ref(null)
let carousel = null

function hoverCarousel() {
  isShownDescription.value = true
  carousel?.pause()
}

function unHoverCarousel() {
  isShownDescription.value = false
  carousel?.cycle()
}

onMounted(async () => {
  const response = await api.getPopularMovies()
  popularMovies.value = response.data.results.filter(movie => movie.backdrop_path !== null)
  await nextTick()
  carousel = new Carousel(carouselEl.value, { interval: 5000, ride: 'carousel', wrap: true })
})

onBeforeUnmount(() => {
  carousel?.dispose()
})
</script>

<style lang="scss">
#carouselExampleIndicators {
  z-index: 0;
}

.popular-movie-img {
  object-position: 100% 0;
  width: 100%;
  height: 550px;
  object-fit: cover
}

.popular-movie-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: left;
  margin-top: 1.5rem;
}

.poster-thumb {
  width: 170px;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
}

.hover-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.blurred {
  filter: blur(3px);
}

.caption {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
  color: #fff;
  background: linear-gradient(0deg, rgba(3, 3, 8, 1) 0%, rgba(1, 1, 3, 0.6306897759103641) 53%, rgba(1, 1, 2, 0.5130427170868348) 71%, rgba(1, 1, 1, 0.35898109243697474) 83%, rgba(0, 0, 0, 0) 100%);

  .title {
    font-size: 2rem;
    letter-spacing: .5px;
    color: lightcyan;
    text-transform: uppercase;
  }

  .description {
    color: #FFFFFFB3;
    font-style: italic;
  }

  .description-enter,
  .description-leave-to {
    opacity: 0;
    margin: 1;
  }

  .description-enter-active,
  .description-leave-active {
    transition: all .5s;
  }
}
</style>