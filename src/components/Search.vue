<template>
  <div id="search">
    <div class="d-flex align-items-center small">
      <i class="fa fa-search fa-fw text-muted position-absolute pl-3"></i>
      <input type="text" v-model="searchText" @click="getTrendingData" class="form-control pl-5"
             placeholder="Search..."/>
    </div>
    <div v-if="isShownSearchList" @click.passive="test" id="search-list" class="list-group position-fixed mr-2 mt-3" style="right: 0">
      <a href="#" v-for="item in searchList" :key="item.id"
         class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{ item.title }}</h5>
          <small>{{ item.release_date }}</small>
        </div>
        <div class="row mt-1" style="width: 40rem">
          <div class="col-md-2 pr-0">
            <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.poster_path">
          </div>
          <div class="col-md-10 pl-0">
            <small class="search-list-description"> {{ item.overview }}</small>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  data() {
    return {
      searchText: '',
      searchList: [],
      isShownSearchList: false,
    }
  },
  mounted() {
    if (document.addEventListener) {
      document.addEventListener('click', this.hideList);
    } else if (document.attachEvent) {
      document.attachEvent('click', this.hideList);
    }
  },
  methods: {
    async getTrendingData() {
      this.isShownSearchList = true;
      let response = await api.getTrendingMovies('all', 'week')
      this.searchList = response.data.results.slice(0, 5)
    },

    search() {

    },

    hideList(event) {
      let listElement = document.getElementById('search-list')
      let searchBox = document.querySelector('#search input')
      if (event.target !== searchBox && event.target !== listElement) {
        this.isShownSearchList = false;
      }
    }
  }
}
</script>
<style>
#search input {
  border-radius: 2rem;
}

.search-list-description {
  overflow: hidden;
  display: -webkit-box;
  /*-webkit-line-clamp: 5;*/
  -webkit-box-orient: vertical;
}
</style>
