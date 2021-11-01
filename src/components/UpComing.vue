<template>
  <movie-slider :movie-data="upComingMovies" :title="title" :show-footer="true">

  </movie-slider>
</template>

<script>
import _ from 'lodash'
import api from "@/api";
import MovieSlider from '../components/MovieSlider'

export default {
  components: {MovieSlider},
  data() {
    return {
      upComingMovies: [],
      title: 'COMING SOON'
    }
  },
  async mounted() {
    await api.getUpComing().then(response => {
          this.upComingMovies = _.chunk(response.data.results, 6)
        }
    )
  },
  methods: {
    route(id) {
      this.$store.commit('routeToClicked', {path: 'movie', query: id})
    }
  }
}
</script>
