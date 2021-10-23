<template>
  <div v-if="!loading" class="container-xxl">
    <div class="container-title">
      <div class="mb-2">
        <span class="font-weight-bold">
          <span class="display-4">
            {{ movieTitle }}
          </span>
          <rating :value="movieData.vote_average" class="float-right mt-2" style="font-size: 2rem"/>
        </span>
      </div>
      <div class="row">
        <div class="col-md-5">
          <img :src="'https://image.tmdb.org/t/p/w500'+movieData.poster_path" class="rounded">
        </div>
        <div class="col-md-7">
          <!--          <img :src="'https://image.tmdb.org/t/p/w500'+movieData.backdrop_path" class="mb-5 w-100">-->
          <span v-for="tags in movieData.genres" :key="tags.id" class="badge bg-secondary mr-1 mb-2">
             <h6 class="mb-0">{{ tags.name }}</h6>
          </span>
          <p class="lead mt-5">
            {{ movieData.overview }}
          </p>
          <p class="mt-5 blockquote-footer font-italic" style="font-size: 1rem">{{ movieData.tagline }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import Rating from "@/components/Rating";
// import loading from '../assets/loading';
import dateFormatter from '../mixins/dateFormatter'

export default {
  mixins: [dateFormatter],
  components: {
    Rating
  },

  data() {
    return {
      movieData: {},
      loading: false,
    }
  },
  computed: {
    movieTitle() {
      return `${this.movieData.title} (${this.getFormattedDate(this.movieData.release_date,'YYYY')})`
    }
  },
  async mounted() {
    this.loading = true;
    try {
      let response = await api.getMovieDetails(this.$route.params.id)
      if (response.status === 200) {
        this.movieData = response.data
        this.loading = false;

      }
    } catch (error) {
      this.loading = false;
    }
  }

}
</script>