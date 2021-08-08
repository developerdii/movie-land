<template>
  <div id="carouselExampleDark" class="carousel carousel-light slide" style="margin: auto;wi" data-bs-ride="carousel"
       @mouseenter="hoverCarousel" @mouseleave="unHoverCarousel">
    <div class="carousel-indicators">
      <button v-for="(movie,index) in popularMovies" :key="index" type="button"
              data-bs-target="#carouselExampleIndicators" :data-bs-slide-to="index" :class="index === 0 ? 'active' : ''"
              :aria-label="'Slide '+(index+1)"></button>
    </div>
    <div class="carousel-inner" role="listbox">
      <div class="carousel-item" :class="index === 0 ? 'active' : ''" :data-bs-interval="carouselInterval"
           v-for="(movie,index) in popularMovies" :key="index">
        <img :src="'https://image.tmdb.org/t/p/original/'+movie.backdrop_path" class="d-block popular-movie-img"
             :class="isShownDescription ? 'blurred' : ''" :alt="movie.title">
        <div class="caption d-none d-md-block hide">
          <p>
            <i v-if="!isShownDescription" class="fas fa-angle-up swipe-animation"
               style="font-size: 2rem;opacity: 0.6; "></i>
            <i v-else class="fas fa-angle-down swipe-animation" style="font-size: 2rem;opacity: 0.6; "></i>
          </p>
          <span v-if="!isShownDescription" class="title">{{ movie.title }}</span>
          <p class="description m-1" v-show="!isShownDescription">
            {{ movie.overview }}
          </p>
          <transition name="description">
            <div class="row popular-movie-card" v-if="isShownDescription">
              <div class="col-md-12">
                <img class="card-img-top w-25" :src="'https://image.tmdb.org/t/p/w500'+movie.poster_path"
                     alt="Card image cap">
                <p class="description m-1">
                  <i class="fas fa-star" style="color: orange"></i> {{ movie.vote_average + ' / 10' }}
                </p>
                <p class="description m-1">
                  <a href="">{{ movie.title }} <i class="fas fa-external-link-alt"></i></a>
                </p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>
<script>
import api from "@/api";

export default {
  data() {
    return {
      popularMovies: [],
      isShownDescription: false,
      carouselInterval: 5000,
    }
  },
  methods: {
    hoverCarousel() {
      this.isShownDescription = true;
      this.carouselInterval = 100000;
    },
    unHoverCarousel() {
      this.isShownDescription = false;
      this.carouselInterval = 5000;
    }
  },
  async mounted() {
    await api.getPopularMovies().then(response => {
          response.data.results.forEach((movie, index) => {
            if (movie.backdrop_path === null) {
              response.data.results.splice(index, 1)
            }
          })
          this.popularMovies = response.data.results
        }
    )
  }

}
</script>

<style lang="scss">
.popular-movie-img {
  object-position: 100% 0;
  width: 100%;
  height: 550px;
  object-fit: cover
}

.swipe-animation {
  -webkit-animation: uparrow 1s infinite alternate ease-in-out;
}

@-webkit-keyframes uparrow {
  0% {
    -webkit-transform: translateY(0);
    opacity: 0.4
  }
  100% {
    -webkit-transform: translateY(-0.4em);
    opacity: 0.9
  }
}

.popular-movie-card {
  padding-top: 6rem;
}

.blurred {
  filter: blur(3px);
}

.caption {
  text-align: center;
  width: 100%;
  padding: 34rem 6rem 3rem 6rem;
  position: absolute;
  bottom: 0;
  //height: 100%;
  color: #fff;
  background: linear-gradient(0deg, rgba(3, 3, 8, 1) 0%, rgba(1, 1, 3, 0.6306897759103641) 53%, rgba(1, 1, 2, 0.5130427170868348) 71%, rgba(1, 1, 1, 0.35898109243697474) 83%, rgba(0, 0, 0, 0) 100%);

  .title {
    font-size: 2rem;
    letter-spacing: 3px;
  }

  .description {
    font-family: Candara, sans-serif;
  }

  .description-enter,
  .description-leave-to {
    opacity: 0;
    margin: 1;
  }

  .description-enter-active,
  .description-leave-active {
    transition: all .5s;
  }
}
</style>