<template>
  <div id="carouselExampleIndicators2" class="carousel slide mb-4" data-bs-ride="carousel">
    <div class="carousel-inner">
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row,index) in upComingMovies"
           :key="index">
        <div class="row">
          <div class="col-md-2 d-flex" v-for="(movie,movieIndex) in row" :key="movieIndex">
            <div class="bg-gradient-dark movie-card">
              <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500'+movie.poster_path"
                   alt="Card image cap">
              <p class="description p-1 text-center">
                {{ movie.title }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators2"
            data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators2"
            data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>

</template>

<script>
import _ from 'lodash'
import api from "@/api";

export default {
  data() {
    return {
      upComingMovies: []
    }
  },
  async mounted() {
    await api.getUpComing().then(response => {
          this.upComingMovies = _.chunk(response.data.results, 6)
        }
    )
  }
}
</script>

<style lang="scss">
$movie-card-radius: 1rem;
.movie-card {
  border-radius: $movie-card-radius;
}

.movie-card img {
  //border-radius: 0.8rem;
  -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, black), color-stop(0.35, black), color-stop(0.5, black), color-stop(0.65, black), color-stop(0.85, rgba(0, 0, 0, 0.6)), color-stop(1, transparent));
  position: relative;
}
</style>