<template>
  <nav id="nav" class="navbar navbar-expand-lg navbar-light shadow-sm bg-light">
    <div class="container-xxl">
      <router-link class="navbar-brand d-flex align-items-center" to="/"><img src="../assets/movieland-logo.svg" alt="Movieland" style="height: 40px; width: auto"></router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll"
              aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarScroll">
        <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">

          <!--            <li class="nav-item dropdown">-->
          <!--              <a class="nav-link dropdown-toggle" href="#" id="navbarScrollingDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">-->
          <!--                Link-->
          <!--              </a>-->
          <!--              <ul class="dropdown-menu" aria-labelledby="navbarScrollingDropdown">-->
          <!--                <li><a class="dropdown-item" href="#">Action</a></li>-->
          <!--                <li><a class="dropdown-item" href="#">Another action</a></li>-->
          <!--                <li><hr class="dropdown-divider"></li>-->
          <!--                <li><a class="dropdown-item" href="#">Something else here</a></li>-->
          <!--              </ul>-->
          <!--            </li>-->

        </ul>
        <search-bar></search-bar>
      </div>
    </div>
  </nav>
</template>

<script>
import SearchBar from "@/components/SearchBar.vue";

export default {
  components: {
    SearchBar
  }
}
</script>