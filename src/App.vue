<template>
  <div id="app">
    <navbar></navbar>
    <div class="router-view container-xxl shadow-sm">
      <router-view/>
    </div>
  </div>
</template>
<script>
import Navbar from './components/Navbar.vue'

export default {
  components: {
    Navbar
  }
}
</script>
