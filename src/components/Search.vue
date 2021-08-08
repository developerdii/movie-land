<template>
  <div id="search">
    <div class="d-flex align-items-center small">
      <i class="fa fa-search fa-fw text-muted position-absolute pl-3"></i>
      <input type="text" v-model="searchText" @click="getTrendingData" class="form-control pl-5"
             placeholder="Search..."/>
    </div>
    <div v-if="isShownSearchList" id="search-list" class="list-group position-fixed mr-2 mt-3 bg-light shadow-sm"
         style="right: 0;">
      <nav id="search-nav-bar" class="nav nav-pills flex-column flex-sm-row">
        <a v-for="media in mediaTypes" :key="media.id" class="flex-sm-fill text-sm-center nav-link shadow m-1"
           :class="defaultMediaType.id === media.id ? 'active' : ''" aria-current="page"
           @click="selectMediaType(media)">
          {{ media.text }}</a>
      </nav>

      <a href="#" v-for="item in searchList" :key="item.id"
         class="list-group-item list-group-item-action flex-column align-items-start">
        <div v-if="item.media_type === 'movie'">
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
        </div>
        <div v-if="item.media_type === 'tv'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>{{ item.first_air_date }}</small>
          </div>
          <div class="row mt-1" style="width: 40rem">
            <div class="col-md-2 pr-0">
              <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.poster_path">
            </div>
            <div class="col-md-10 pl-0">
              <small class="search-list-description"> {{ item.overview }}</small>
            </div>
          </div>
        </div>
        <div v-if="item.media_type === 'person'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>Popularity: <span class="text-info">{{ item.popularity }}</span></small>
          </div>
          <div class="row mt-1" style="width: 40rem">
            <div class="col-md-2 pr-0">
              <img style="width: 70%;" :src="'https://image.tmdb.org/t/p/w500'+item.profile_path">
            </div>
            <div class="col-md-10 pl-0">
              <p v-for="(movie,index) in item.known_for" :key="index" class="font-weight-light m-1">
                <a class="font-weight-light" href="">{{ movie.title + ' - ' }}</a>
                <i class="fas fa-star" style="color: orange"></i> {{ movie.vote_average }}
              </p>
            </div>
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
      defaultMediaType: {
        id: 1,
        type: 'movie',
        text: 'Movie'
      },
      mediaTypes: [
        {
          id: 1,
          type: 'movie',
          text: 'Movie'
        },
        {
          id: 2,
          type: 'tv',
          text: 'TV'
        },
        {
          id: 3,
          type: 'person',
          text: 'Person'
        },
      ],
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
    async getTrendingData(media = this.defaultMediaType) {
      this.isShownSearchList = true;
      let response = await api.getTrendingMovies(this.defaultMediaType.type, 'day')
      this.searchList = response.data.results.slice(0, 5)
    },

    selectMediaType(media) {
      this.defaultMediaType = media;
      this.getTrendingData()
    },

    search() {

    },

    hideList(event) {
      let listElement = document.getElementById('search-list')
      let searchBox = document.querySelector('#search input')
      let searchNavBar = document.querySelector('#search-nav-bar')
      if (event.target !== searchBox && event.target !== listElement && event.srcElement.parentElement !== searchNavBar) {
        console.log(event, searchNavBar)
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
