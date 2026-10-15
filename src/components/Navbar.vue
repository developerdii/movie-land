<template>
  <nav id="nav" class="navbar navbar-expand-lg navbar-light shadow-sm bg-light">
    <div class="container-xxl">
      <router-link class="navbar-brand d-flex align-items-center" to="/"><img src="../assets/movieland-logo.svg" alt="Movieland" style="height: 40px; width: auto"></router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll"
              aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarScroll">
        <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;"></ul>
        <search-bar></search-bar>
      </div>
    </div>
  </nav>
</template>

<script setup>
import SearchBar from '@/components/SearchBar.vue'
</script>
