<template>
  <div>
    <h2 class="container-title mb-0"> {{ title }}</h2>
    <div id="carouselExampleIndicators2" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row,index) in upComingMovies"
             :key="index" data-bs-interval="300033">
          <div class="row pr-3 pl-3">
            <div class="col-md-2 p-1 d-flex" v-for="(movie,movieIndex) in row" :key="movieIndex">
              <div class="movie-card">
                <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500'+movie.poster_path"
                     alt="Card image cap">
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
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators2"
              data-bs-slide="prev">
        <span class="carousel-control-prev-icon p-3" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators2"
              data-bs-slide="next">
        <span class="carousel-control-next-icon p-3" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import api from "@/api";
import dateFormatter from '../mixins/dateFormatter'

export default {
  mixins: [dateFormatter],
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
}
</script>

<style lang="scss">
$movie-card-radius: 1.2rem;
.movie-card {
  box-shadow: rgba(60, 64, 67, 0.3) 0 1px 2px 0, rgba(60, 64, 67, 0.15) 0 1px 3px 1px;
  color: #fff;
  background: linear-gradient(0deg, #273b4f 0%, #34495e 100%);
  border-radius: $movie-card-radius $movie-card-radius calc(#{$movie-card-radius} / 2) calc(#{$movie-card-radius} / 2);
  cursor: pointer;
  display: flex;
  flex-direction: column;

  img {
    border-radius: calc(#{$movie-card-radius} - 0.2rem) calc(#{$movie-card-radius} - 0.3rem) 0 0;
    -webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, black), color-stop(0.35, black), color-stop(0.5, black), color-stop(0.65, black), color-stop(0.85, rgba(0, 0, 0, 0.6)), color-stop(1, transparent));
  }

  .description {
    transition: transform 1.5s ease;
    min-height: 5.5rem;
    color: lightcyan;
    text-transform: uppercase;
  }

  .description:hover {
    transform: scale(1.1);
    color: #0c63e4;
  }

  .footer {
    margin-top: auto;
    font-size: 80%;
    color: #FFFFFFB3;
    font-weight: bolder;
    background-color: rgba(15, 15, 14, 0.15);
    border-radius: 0 0 calc(#{$movie-card-radius} / 2) calc(#{$movie-card-radius} / 2);
    border-top: solid rgb(255, 255, 255, .2) .05rem;
  }
}

.container-title {
  background: linear-gradient(180deg, rgba(247,247,247,1) 0%, rgba(247,247,247,0) 100%);
  padding: 0.2rem 0.5rem;
  clear: both;
  color: #2c3e50;
  border-top: 0.2rem solid #351C75;
}

#carouselExampleIndicators2 {
  z-index: 0;
  .carousel-control-prev {
    background: radial-gradient(circle closest-side, rgba(0,0,0,.1), transparent);
    margin: 10rem 0;
  }
  .carousel-control-next {
    background: radial-gradient(circle closest-side, rgba(0,0,0,.1), transparent);
    border-radius: 10px;
    margin: 10rem 0;
  }
}


</style>