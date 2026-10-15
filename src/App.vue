<template>
  <div id="app">
    <navbar></navbar>
    <div class="router-view container-xxl shadow-sm">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  await auth.loadAccount()

  // Complete the TMDB login callback (request_token + approved in query string).
  const params = new URLSearchParams(window.location.search)
  const requestToken = params.get('request_token')
  const approved = params.get('approved')
  if (requestToken && approved === 'true') {
    await auth.completeLogin(requestToken)
    window.history.replaceState({}, '', window.location.pathname)
  }
})
</script>

