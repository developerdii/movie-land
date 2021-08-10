<template>
  <div id="home" class="home-page">
      <div class="row">
        <div class="col-md-12">
          <slider/>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mt-5 mb-5">
          <up-coming/>
        </div>
      </div>
  </div>
</template>

<script>
import Slider from '../components/PopularMoviesSlider'
import UpComing from "@/components/UpComing";

export default {
  name: 'Home',
  components: {
    Slider,
    UpComing
  }
}
</script>

<style>
</style>
