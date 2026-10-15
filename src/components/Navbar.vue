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
        <div class="d-flex flex-column flex-lg-row align-items-lg-center gap-2 gap-lg-3">
          <search-bar></search-bar>
          <a v-if="!auth.isAuthenticated" href="#" class="nav-link px-0 px-lg-2 text-nowrap" @click.prevent="login">
            <i class="bi bi-person me-1"></i>Giriş Yap
          </a>
          <div v-else class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle text-nowrap" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle me-1"></i>{{ auth.name }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><router-link class="dropdown-item" to="/favorites"><i class="bi bi-heart me-2"></i>Favoriler</router-link></li>
              <li><router-link class="dropdown-item" to="/watchlist"><i class="bi bi-bookmark me-2"></i>İzleme Listesi</router-link></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i>Çıkış Yap</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import SearchBar from '@/components/SearchBar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

async function login() {
  await auth.startLogin()
}

async function logout() {
  await auth.logout()
}
</script>
