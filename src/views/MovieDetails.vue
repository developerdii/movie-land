<template>
  <div v-if="!loading" class="container-xxl">
    <div class="container-title">
      <div class="mb-2">
        <span class="font-weight-bold">
          <div class="row">
            <div class="col-md-10">
              <span class="display-4">
                {{ movieTitle }}
              </span>
            </div>
            <div class="col-md-2">
              <rating :value="movieData.vote_average" class="float-right mt-2" style="font-size: 2rem"/>
            </div>
          </div>
        </span>
      </div>
      <div class="container-xxl">
        <div class="row">
          <div class="col-md-5">
            <img :src="'https://image.tmdb.org/t/p/w500'+movieData.poster_path" class="rounded">
          </div>
          <div class="col-md-7">
            <div v-if="selectedTab === Enums.SLIDER">
            <span v-for="tags in movieData.genres" :key="tags.id" class="badge bg-secondary mr-1 mb-2">
             <h6 class="mb-0">{{ tags.name }}</h6>
          </span>
              <p class="lead mt-5">
                {{ movieData.overview }}
              </p>
              <p v-if="movieData.tagline" class="mt-5 blockquote-footer font-italic" style="font-size: 1rem">
                {{ movieData.tagline }}</p>
            </div>
            <div class="column-footer">
              <ul class="nav justify-content-center">
                <li class="nav-item">
                  <a class="nav-link nav-icon" :class="selectedTab === Enums.SLIDER ? 'text-primary' : ''"
                     href="javascript:void(0);" @click="selectViewTab(Enums.SLIDER)">
                    <i class="fa fa-th-large"></i>
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-icon" :class="selectedTab === Enums.LIST ? 'text-primary' : ''"
                     href="javascript:void(0);" @click="selectViewTab(Enums.LIST)">
                    <i class="fa fa-bars"></i>
                  </a>
                </li>
              </ul>
              <div class="row">
                <slider v-if="selectedTab === Enums.SLIDER">
                  <div slot="card">
                    <div class="carousel-item" :class="index === 0 ? 'active' : ''" v-for="(row,index) in cast"
                         :key="index" data-bs-interval="300033">
                      <div class="row pr-3 pl-3">
                        <div class="col-md-3 p-1 d-flex" v-for="(person,personIndex) in row" :key="personIndex">
                          <div class="movie-card">
                            <img class="card-img-top" :src="'https://image.tmdb.org/t/p/w500'+person.profile_path">
                            <p class="p-2 text-center mb-0 pb-0">
                              {{ person.name }}
                            </p>
                            <div class="p-2 text-center footer" style="min-height: 60px">
                              {{ person.character }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </slider>
                <div v-if="selectedTab === Enums.LIST">
                  <div style="min-height: 60vh">
                    <div class="row border rounded bg-white" style="width: 45rem;" v-for="(person, index) in cast[page]" :key="index">
                      <div class="col-md-2 pl-0">
                        <img class="rounded-left" style="width: 60%;" :src="'https://image.tmdb.org/t/p/w500'+person.profile_path">
                      </div>
                      <div class="col-md-10">
                        <p class="lead"><strong>{{ person.name }}</strong></p>
                        <p class="text-muted">{{ person.character }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="pt-2">
                    <ul class="pagination float-right mr-5 mb-0" style="font-size: 1.5rem">
                      <li @click="changePage(true)"><a :class="disableNext ? 'disable-paginate' : ''" href="javascript:void(0);">
                        <i class="fas fa-chevron-right"></i>
                      </a></li>
                    </ul>
                    <ul class="pagination float-left mb-0" style="font-size: 1.5rem">
                      <li @click="changePage(false)"><a :class="disablePrevious ? 'disable-paginate' : ''" href="javascript:void(0);">
                        <i class="fas fa-chevron-left"></i>
                      </a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="recommendations" class="row mt-2">
          <movie-slider id="recommendations" :movie-data="recommendations" :show-footer="false"
                        title="Recommendations"></movie-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import Rating from "@/components/Rating";
import dateFormatter from '../mixins/dateFormatter';
import Slider from '../components/Slider'
import MovieSlider from '../components/MovieSlider'
import Enums from '../enums'
import _ from "lodash";

export default {
  mixins: [dateFormatter],
  components: {
    Rating,
    Slider,
    MovieSlider
  },

  data() {
    return {
      movieData: {},
      cast: [],
      fullCastData: [],
      recommendations: [],
      loading: false,
      selectedTab: Enums.SLIDER,
      Enums,
      page: 0,
    }
  },
  watch: {
    $route() {
      Object.assign(this.$data, this.$options.data());
      this.loadPage();
    }

  },
  computed: {
    movieTitle() {
      return `${this.movieData.title} (${this.getFormattedDate(this.movieData.release_date, 'YYYY')})`
    },

    castViewSize() {
      return this.selectedTab === Enums.SLIDER ? 4 : 6;
    },

    disablePrevious() {
      return this.page <= 0;
    },

    disableNext() {
      let pageSize = this.cast.length;
      return this.page >= pageSize - 1;
    }
  },

  mounted() {
    this.loadPage();
  },

  methods: {
    async loadPage() {
      this.loading = true;
      await this.getData();
      await this.getCredits();
      await this.getRecommendations();
      this.loading = false;
    },

    async getData() {
      try {
        let response = await api.getMovieDetails(this.$route.query.id)
        if (response.status === 200) {
          this.movieData = response.data;
        }
      } catch (error) {
        console.log(error)
      }
    },

    async getCredits() {
      try {
        let response = await api.getMovieCredits(this.$route.query.id)
        if (response.status === 200) {
          this.fullCastData = response.data.cast;
          this.chunkCredits(this.fullCastData);
        }
      } catch (error) {
        console.log(error);
      }
    },

    chunkCredits(data) {
      this.cast = _.chunk(data.filter(person => person.profile_path), this.castViewSize);
    },

    async getRecommendations() {
      try {
        let response = await api.getRecommendationsMovies(this.$route.query.id)
        if (response.status === 200) {
          this.recommendations = _.chunk(response.data.results, 6);
        }
      } catch (error) {
        console.log(error);
      }
    },

    selectViewTab(id) {
      this.selectedTab = id;
      this.page = 0;
      this.chunkCredits(this.fullCastData);
    },

    changePage(isNext) {
      if (isNext) {
        if (this.disableNext) return
        this.page++
      } else {
        if (this.disablePrevious) return
        this.page--;
      }
    }
  }

}
</script>

<style lang="scss">
.column-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: auto;
}

.nav-icon {
  color: gray;
}

.active {
  color: red;
}

.disable-paginate {
  color: #6c757d;
  pointer-events: none;
  cursor: default;
}
</style>