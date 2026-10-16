<template>
  <slider :id="id" :show-indicators="showIndicators" :show-position="showPosition" :show-arrows="showArrows" @slid="$emit('slid', $event)">
    <template #card>
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row, index) in movieData" :key="index">
        <div class="movie-card-row">
          <poster-card
            v-for="(movie, movieIndex) in row"
            :key="movieIndex"
            :variant="variant"
            :item="movie"
            :media-type="type"
            :show-type="showType"
            @navigate="route"
          />
        </div>
      </div>
    </template>
  </slider>
</template>

<script setup>
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

const router = useRouter()

function route(item) {
  router.push({ path: props.type, query: { id: item.id } })
}
</script>

