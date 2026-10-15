<template>
  <div>
    <slot name="title"></slot>
    <div ref="carouselEl" :id="id" class="carousel slide" style="z-index: 0">
      <div class="carousel-inner">
        <slot name="card"></slot>
      </div>
      <div v-if="showIndicators && totalSlides > 1" class="carousel-indicators">
        <button v-for="n in totalSlides" :key="n" type="button"
                :data-bs-target="'#' + id" :data-bs-slide-to="n - 1"
                :class="n === activeSlide ? 'active' : ''" :aria-label="'Slide ' + n"></button>
      </div>
      <button class="carousel-control-prev" type="button" :data-bs-target="'#' + id"
              data-bs-slide="prev">
        <span class="carousel-control-prev-icon p-3" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" :data-bs-target="'#' + id"
              data-bs-slide="next">
        <span class="carousel-control-next-icon p-3" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
      <div v-if="showPosition && totalSlides > 1" class="carousel-position">
        <span class="badge text-bg-dark">{{ activeSlide }} / {{ totalSlides }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Carousel } from 'bootstrap'

defineProps({
  id: {
    type: String,
    default: 'carouselExampleIndicators2'
  },
  showIndicators: {
    type: Boolean,
    default: false
  },
  showPosition: {
    type: Boolean,
    default: true
  }
})

const carouselEl = ref(null)
const activeSlide = ref(1)
const totalSlides = ref(0)
let carousel = null

onMounted(() => {
  carousel = new Carousel(carouselEl.value, { wrap: true })
  totalSlides.value = carouselEl.value.querySelectorAll('.carousel-item').length
  carouselEl.value.addEventListener('slid.bs.carousel', (e) => {
    activeSlide.value = (e.to || 0) + 1
  })
})

onBeforeUnmount(() => {
  carousel?.dispose()
})
</script>

<style lang="scss">
$movie-card-radius: 1.2rem;
.movie-card {
  box-shadow: rgba(60, 64, 67, 0.3) 0 1px 2px 0, rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
  color: #fff;
  //background: linear-gradient(0deg, #273b4f 0%, #34495e 100%);
  background-color: #2d3436;
  background-image: linear-gradient(315deg, #2d3436 0%, #000000 74%);
  border-radius: $movie-card-radius $movie-card-radius calc(#{$movie-card-radius} / 2) calc(#{$movie-card-radius} / 2);
  cursor: pointer;
  display: flex;
  flex-direction: column;

  img {
    border-radius: $movie-card-radius $movie-card-radius 0 0;
    display: block;
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 58%, rgba(0, 0, 0, .78) 78%, transparent 100%);
    mask-image: linear-gradient(to bottom, #000 0%, #000 58%, rgba(0, 0, 0, .78) 78%, transparent 100%);
  }

  .description {
    transition: transform 1.5s ease;
    min-height: 5.5rem;
    color: #fff;
    text-transform: uppercase;
  }

  .description:hover {
    transform: scale(1.1);
    color: var(--ml-brand-accent);
  }

  .footer {
    margin-top: auto;
    font-size: 80%;
    color: #FFFFFFB3;
    font-weight: bolder;
    background-color: rgba(15, 15, 14, 0.15);
    border-radius: 0 0 calc(#{$movie-card-radius} / 2) calc(#{$movie-card-radius} / 2);
    border-top: solid rgb(255, 255, 255, .2) .05rem;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 80px;
  }
}

.container-title {
  background: transparent;
  padding: 0.55rem 0.5rem 0;
  clear: both;
  color: var(--ml-brand-dark);
  border-top: 3px solid var(--ml-brand-accent);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.carousel-control-prev {
  background: radial-gradient(circle closest-side, rgba(0, 0, 0, .1), transparent);
  margin: 10rem 0;
}

.carousel-control-next {
  background: radial-gradient(circle closest-side, rgba(0, 0, 0, .1), transparent);
  border-radius: 10px;
  margin: 10rem 0;
}

.carousel-position {
  position: absolute;
  top: 0.5rem;
  right: 1.25rem;
  z-index: 2;
}


</style>
