<template>
  <div id="app">
    <navbar></navbar>
    <div class="router-view container-xxl shadow-sm" :class="{ 'router-view--compact': route.meta.compactCard }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()
</script>

