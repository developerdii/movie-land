<template>
  <div id="app">
    <navbar></navbar>
    <div class="router-view container-xxl shadow-sm">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

