<template>
  <div v-if="slides.length">
    <section-heading eyebrow="Your history" title="Recently Viewed">
      <template #actions>
        <round-pagination :page="index" :page-count="slides.length" @update:page="goToSlide" />
      </template>
    </section-heading>
    <movie-slider ref="slider" id="recent-carousel" :movie-data="slides" :show-type="true" :show-position="false" :show-arrows="false" @slid="onSlid"></movie-slider>
  </div>
</template>

<script setup>
// The films, TV shows and people opened most recently, at the end of the home page: up to three slides of six, with
// the same page control as the other home sliders. Only the ids are saved on the device, so each title is fetched
// again here. The section appears once there is a first slide of six.
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import MovieSlider from '@/components/MovieSlider.vue'
import RoundPagination from '@/components/RoundPagination.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { chunk } from '@/utils/collection'
import { recentVisits } from '@/composables/useRecent'

const SLIDE_SIZE = 6
const titles = ref([])
const index = ref(1)
const slider = ref(null)
// Every page is a full slide of six, except possibly the last one, so no recent title is left out.
const slides = computed(() => (titles.value.length >= SLIDE_SIZE ? chunk(titles.value, SLIDE_SIZE) : []))

function onSlid(payload) {
  index.value = payload.index
}

// The page control is 1-based; the carousel is 0-based.
function goToSlide(page) {
  slider.value?.goTo(page - 1)
}

function detailsFor({ type, id }) {
  if (type === 'movie') return api.getMovieDetails(id)
  if (type === 'tv') return api.getTvDetails(id)
  return api.getPersonDetails(id)
}

// The card fields the poster cards read: title or name, poster_path or profile_path, and genre_ids.
function asCard({ type, id }, data) {
  if (type === 'person') {
    return { id, name: data.name, profile_path: data.profile_path, known_for_department: data.known_for_department, media_type: 'person' }
  }
  const genre_ids = (data.genres || []).map((genre) => genre.id)
  if (type === 'tv') {
    return { id, name: data.name, poster_path: data.poster_path, first_air_date: data.first_air_date, vote_average: data.vote_average, genre_ids, media_type: 'tv' }
  }
  return { id, title: data.title, poster_path: data.poster_path, release_date: data.release_date, vote_average: data.vote_average, genre_ids, media_type: 'movie' }
}

onMounted(async () => {
  const visits = recentVisits()
  const results = await Promise.allSettled(visits.map(detailsFor))
  // A title TMDB no longer returns is skipped, so the count can drop below six and the section stays hidden.
  titles.value = results.flatMap((result, position) => (
    result.status === 'fulfilled' ? [asCard(visits[position], result.value.data)] : []
  ))
})
</script>
