<template>
  <slider ref="slider" :id="id" :show-indicators="showIndicators" :show-position="showPosition" :show-arrows="showArrows" @slid="$emit('slid', $event)">
    <template #card>
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in movieData" :key="index">
        <div class="movie-card-row">
          <poster-card
            v-for="(movie, movieIndex) in row"
            :key="movieIndex"
            :variant="movie.media_type === 'person' ? 'person-v2' : variant"
            :item="movie"
            :media-type="movie.media_type || type"
            :show-type="showType && movie.media_type !== 'person'"
            @navigate="route"
          />
        </div>
      </div>
    </template>
  </slider>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Slider from './Slider.vue'
import PosterCard from './PosterCard.vue'

const props = defineProps({
  movieData: { type: Array, default: null },
  id: { type: String, default: 'carouselExampleIndicators2' },
  showIndicators: { type: Boolean, default: false },
  showPosition: { type: Boolean, default: true },
  showArrows: { type: Boolean, default: true },
  type: { type: String, default: 'movie' },
  variant: { type: String, default: 'movie' },
  showType: { type: Boolean, default: false }
})

defineEmits(['slid'])

const slider = ref(null)

// Moves to a 0-based slide, for the shared page control.
defineExpose({ goTo: (index) => slider.value?.goTo(index) })

const router = useRouter()

// Items from a mixed list (the recently viewed slider) carry their own media_type; the others use the slider's type.
function route(item) {
  router.push({ path: item.media_type || props.type, query: { id: item.id } })
}
</script>

