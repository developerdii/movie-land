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
      <button v-if="showArrows" class="carousel-control-prev" type="button" :data-bs-target="'#' + id"
              data-bs-slide="prev">
        <span class="carousel-control-prev-icon p-3" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button v-if="showArrows" class="carousel-control-next" type="button" :data-bs-target="'#' + id"
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
  },
  showArrows: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['slid'])

const carouselEl = ref(null)
const activeSlide = ref(1)
const totalSlides = ref(0)
let carousel = null

onMounted(() => {
  // Touch swipes are left to the poster rows, which scroll sideways on phones; the page control moves the slides.
  carousel = new Carousel(carouselEl.value, { wrap: true, touch: false })
  totalSlides.value = carouselEl.value.querySelectorAll('.carousel-item').length
  emit('slid', { index: activeSlide.value, total: totalSlides.value })
  carouselEl.value.addEventListener('slid.bs.carousel', (e) => {
    activeSlide.value = (e.to || 0) + 1
    emit('slid', { index: activeSlide.value, total: totalSlides.value })
  })
})

onBeforeUnmount(() => {
  carousel?.dispose()
})

// Moves to a 0-based slide. The shared page control uses it; 'slid' still reports the new slide.
function goTo(index) {
  carousel?.to(index)
}

defineExpose({ goTo })
</script>

<style lang="scss">
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

/* A poster card lifts and gets a gold ring on hover, and the carousel box would cut both off at its left, right
   and top edges. The padding leaves room for that, and the negative margin and width keep the slides where they were. */
.carousel-inner {
  width: calc(100% + 20px);
  margin: -10px;
  padding: 10px;
}


</style>
