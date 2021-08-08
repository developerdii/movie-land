<template>
  <div id="app">
    <navbar></navbar>
    <div class="router-view container-xxl shadow-sm">
      <router-view/>
    </div>
  </div>
</template>
<script>
import Navbar from './components/Navbar'

export default {
  components: {
    Navbar
  }
}
</script>

<style lang="scss">
@import "assets/scss/app.scss";
</style>
