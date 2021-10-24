<template>
  <slider>
    <div slot="title">
      <h2 class="container-title mb-0"> {{ title }}</h2>
    </div>
    <div slot="card">
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row,index) in upComingMovies"
           :key="index" data-bs-interval="300033">
        <div class="row pr-3 pl-3">
          <div class="col-md-2 p-1 d-flex" v-for="(movie,movieIndex) in row" :key="movieIndex" @click="route(movie.id)">
            <div class="movie-card">
              <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500'+movie.poster_path">
              <p class="description p-2 text-center mb-0 pb-0">
                {{ movie.title }}
              </p>
              <div class="p-2 text-center footer">
                {{ getFormattedDate(movie.release_date, 'MMM Do YY') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </slider>
</template>

<script>
import _ from 'lodash'
import api from "@/api";
import dateFormatter from '../mixins/dateFormatter'
import Slider from '../components/Slider'

export default {
  mixins: [dateFormatter],
  components: {Slider},
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
