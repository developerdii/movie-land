<template>
  <div v-if="slides.length">
    <section-heading eyebrow="Birthdays" title="Born Today">
      <template #actions>
        <progress-pagination :page="index" :page-count="slides.length" @update:page="goToSlide" />
      </template>
    </section-heading>
    <movie-slider ref="slider" id="born-today-carousel" :movie-data="slides" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
// The people born today, most popular first, above Recently Viewed on the home page: up to three slides of six. The
// section appears once there is a first slide of six, like the other home lists.
import { computed, onMounted, ref } from 'vue'
import MovieSlider from '@/components/MovieSlider.vue'
import ProgressPagination from '@/components/ProgressPagination.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { chunk } from '@/utils/collection'
import { loadBornToday } from '@/composables/useBornToday'

const SLIDE_SIZE = 6
const people = ref([])
const index = ref(1)
const slider = ref(null)
const slides = computed(() => (people.value.length >= SLIDE_SIZE ? chunk(people.value, SLIDE_SIZE) : []))

function onSlid(payload) {
  index.value = payload.index
}

// The page control is 1-based; the carousel is 0-based.
function goToSlide(page) {
  slider.value?.goTo(page - 1)
}

onMounted(async () => {
  people.value = await loadBornToday()
})
</script>
