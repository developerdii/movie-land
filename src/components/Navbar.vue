<template>
  <nav id="nav" class="navbar navbar-expand-lg navbar-light shadow-sm bg-light">
    <div class="container-xxl">
      <a class="navbar-brand" href="#"><img class="w-50" src="../assets/logo.svg" alt=""></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll"
              aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarScroll">
        <ul class="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style="--bs-scroll-height: 100px;">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" href="#" to="/link">Link</router-link>
          </li>


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
        <search></search>
      </div>
    </div>
  </nav>
</template>

<script>
import Search from "@/components/Search";

export default {
  components: {
    Search
  }
}
</script>