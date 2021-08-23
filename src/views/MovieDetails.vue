<template>
  <div v-if="!loading"  class="container">
<!--    <loading/>-->
    <div class="col-md-4">
      <img :src="'https://image.tmdb.org/t/p/w500'+movieData.poster_path" alt="">
    </div>
    <div class="col-md-8">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis, praesentium quibusdam. Ab consectetur
      cupiditate, distinctio dolore dolores ea illo iste minus nam nulla praesentium, quam quas, rem soluta tempora
      voluptatem.

    </div>
  </div>
</template>

<script>
import api from "@/api";
// import loading from '../assets/loading';

export default {
  components: {
    // loading
  },

  data() {
    return {
      movieData: {},
      loading: false,
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