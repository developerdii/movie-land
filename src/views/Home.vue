<template>
  <div id="home" class="home-page">
    <div class="row">
      <div class="col-md-12">
        <slider />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <up-coming />
      </div>
    </div>
    <!-- Sections from the newest movie and TV bookmarks. Each one stays hidden unless TMDB has at least 6 titles for it. -->
    <div v-for="source in forYou" :key="source.type + source.id" class="row">
      <div class="col-md-12 page-block">
        <list-section
          :id="'for-you-' + source.type + '-' + source.id"
          :eyebrow="'Because you bookmarked ' + source.title"
          :title="source.type === 'movie' ? 'More Movies Like It' : 'More Shows Like It'"
          :type="source.type"
          :min-items="6"
          :load="() => recommendationsFor(source)"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <list-section id="popular-movies-carousel" eyebrow="Right now" title="Popular Movies" type="movie" :load="api.getPopularMovies" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <list-section id="popular-tv-carousel" eyebrow="Right now" title="Popular TV Shows" type="tv" :load="api.getPopularTv" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <list-section id="top-rated-carousel" eyebrow="All time" title="Top Rated Movies" type="movie" :load="api.getTopRatedMovies" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <born-today />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 page-block">
        <recently-viewed />
      </div>
    </div>
  </div>
</template>

<script setup>
import Slider from '../components/PopularMoviesSlider.vue'
import UpComing from '@/components/UpComing.vue'
import { onMounted, ref } from 'vue'
import ListSection from '@/components/ListSection.vue'
import BornToday from '@/components/BornToday.vue'
import RecentlyViewed from '@/components/RecentlyViewed.vue'
import api from '@/api'
import { useBookmarks } from '@/composables/useBookmarks'

// How many "For you" sections to show: the three newest movie or TV bookmarks, going back from the newest.
const FOR_YOU_COUNT = 3

const { recent } = useBookmarks()
const forYou = ref([])

// Their titles come from TMDB, because only ids are stored.
async function loadForYou() {
  const sources = recent(['movie', 'tv'], FOR_YOU_COUNT)
  const details = await Promise.allSettled(sources.map((source) => (
    source.type === 'movie' ? api.getMovieDetails(source.id) : api.getTvDetails(source.id)
  )))
  forYou.value = sources.flatMap((source, index) => {
    const result = details[index]
    if (result.status !== 'fulfilled') return []
    return [{ ...source, title: result.value.data.title || result.value.data.name }]
  })
}

function recommendationsFor(source) {
  return source.type === 'movie' ? api.getRecommendationsMovies(source.id) : api.getTvRecommendations(source.id)
}

onMounted(loadForYou)
</script>

