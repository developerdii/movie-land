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
        <img :src="'https://image.tmdb.org/t/p/original/'+movie.backdrop_path" class="d-block popular-movie-img" :alt="movie.title">
        <div class="caption">
          <div class="popular-movie-card">
            <img class="poster-thumb" :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path" :alt="`${movie.title} poster`">
            <div class="popular-movie-copy">
              <span class="hero-kicker">Popular right now</span>
              <h2 class="hover-title mb-2">{{ movie.title }}</h2>
              <rating :value="movie.vote_average"></rating>
              <router-link class="btn btn-gold mt-3" :to="{ path: 'movie', query: { id: movie.id } }">
                <i class="bi bi-play-fill me-1"></i>View Details
              </router-link>
              <transition name="description">
                <p v-if="isShownDescription && movie.overview" class="hero-overview mt-3 mb-0">{{ movie.overview }}</p>
              </transition>
            </div>
          </div>
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
  height: clamp(360px, 43vw, 570px);
  object-fit: cover
}

.popular-movie-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(1.25rem, 4vw, 3.5rem);
  text-align: left;
  width: min(900px, 86%);
  margin-left: 9%;
}

.poster-thumb {
  width: clamp(145px, 18vw, 230px);
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.5);
  transition: transform .3s ease;
}

.hover-title {
  font-size: clamp(1.7rem, 3.2vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.caption {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  padding: 2rem 0;
  color: #fff;
  background: linear-gradient(90deg, rgba(3, 8, 15, .88), rgba(3, 8, 15, .46) 58%, rgba(0, 0, 0, .08)), linear-gradient(0deg, rgba(3, 3, 8, .72), transparent 75%);
  transition: background .25s ease;

}

#carouselExampleIndicators { overflow: hidden; border-radius: 16px; box-shadow: 0 18px 44px rgba(17, 25, 39, .18); }
#carouselExampleIndicators .carousel-item::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(3,8,15,.42), transparent 70%); }
#carouselExampleIndicators .caption { z-index: 1; }
.poster-thumb { max-height: 320px; object-fit: cover; }
.hero-kicker { display: block; color: #ffc45a; font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; margin-bottom: .55rem; }
.hero-overview { max-width: 54ch; color: rgba(255,255,255,.88); line-height: 1.6; font-size: .98rem; }
.description-enter-active, .description-leave-active { transition: opacity .2s ease, transform .2s ease; }
.description-enter-from, .description-leave-to { opacity: 0; transform: translateY(-5px); }
#carouselExampleIndicators:hover .poster-thumb { transform: translateY(-3px); }
@media (max-width: 767.98px) {
  .popular-movie-img { height: 360px; }
  .caption { padding: .75rem 0; }
  .popular-movie-card { width: 90%; margin-left: 6%; gap: .8rem; }
  .poster-thumb { width: clamp(90px, 27vw, 150px); max-height: 230px; }
  .hover-title { font-size: clamp(1.15rem, 5vw, 1.7rem); }
  .hero-kicker { font-size: .62rem; margin-bottom: .25rem; }
  .popular-movie-copy .btn { padding: .4rem .8rem; font-size: .82rem; }
  .hero-overview { font-size: .8rem; line-height: 1.4; }
}
</style>
