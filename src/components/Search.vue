<template>
  <div id="search">
    <div class="d-flex align-items-center small">
      <i v-if="!loading" class="fa fa-search fa-fw text-muted position-absolute pl-3"></i>
      <i v-else class="fas fa-spinner fa-spin text-muted position-absolute ml-3"></i>
      <input type="text" v-model="searchText" @click="getList" @keyup="debounceInput" class="form-control pl-5"
             placeholder="Search..."/>
    </div>
    <div v-if="isShownSearchList" id="search-list" class="list-group position-fixed mr-2 mt-1 bg-light shadow-sm"
         style="right: 0; overflow-y: auto; max-height: 92vh">
      <nav id="search-nav-bar" class="nav nav-pills sticky-top bg-light shadow-sm flex-column flex-sm-row">
        <a v-for="media in mediaTypes" :key="media.id" class="flex-sm-fill text-sm-center nav-link shadow m-1"
           :class="defaultMediaType.id === media.id ? 'active' : ''" aria-current="page"
           @click="selectMediaType(media)">
          {{ media.text }}</a>
      </nav>
      <a href="javascript:void(0)" @click="route(item.media_type || defaultMediaType.type,item.id)" v-for="item in searchList" :key="item.id"
         class="list-group-item list-group-item-action flex-column align-items-start">
        <div v-if="item.media_type === 'movie' || defaultMediaType.type === 'movie'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.title }}</h5>
            <small>{{ getFormattedDate(item.release_date, 'YYYY') }}</small>
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
        <div v-if="item.media_type === 'tv' || defaultMediaType.type === 'tv'">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ item.name }}</h5>
            <small>{{ getFormattedDate(item.first_air_date, 'YYYY') }}</small>
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
        <div v-if="item.media_type === 'person' || defaultMediaType.type === 'person'">
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
                <template v-if="movie.title">
                  <a class="font-weight-light" href="javascript:void(0);" @click="route('movie', movie.id)">{{ movie.title + ' - ' }}</a>
                  <i class="fas fa-star" style="color: orange"></i> {{ movie.vote_average }}
                </template>
              </p>
            </div>
          </div>
        </div>
      </a>
      <div v-if="searchList.length === 0" style="padding: 2rem 3rem;">
        <div class="w-100 text-center">
          <h5 class="p-10 m-10">{{ 'Nothing Found' }}</h5>
        </div>
        <div class="row mt-1" style="width: 40rem">
          <div class="col-md-10 pl-0">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import _ from 'lodash'
import dateFormatter from "@/mixins/dateFormatter";

export default {
  mixins: [dateFormatter],
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
      trendingData: {
        movie: [],
        tv: [],
        person: [],
      },
      isShownSearchList: false,
      loading: false,
      searchValue: {
        movie: {
          name: null,
          data: null,
        },
        tv: {
          name: null,
          data: null,
        },
        person: {
          name: null,
          data: null,
        },
      }
    }
  },

  watch: {
    searchText(value) {
      if (value === '') {
        this.getTrendingData()
      }
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
      this.loading = true;

      if (this.trendingData[this.defaultMediaType.type].length > 0) {
        this.searchList = this.trendingData[this.defaultMediaType.type];
        this.loading = false;
        this.isShownSearchList = true;
        return;
      }

      try {
        let response = await api.getTrendingMovies(this.defaultMediaType.type, 'day')
        if (response.request.status === 200) {
          this.isShownSearchList = true;
          this.loading = false;
          this.searchList = response.data.results.filter(item => {
            if (this.defaultMediaType.id === 3) {
              return item.profile_path !== null
            } else {
              return item.poster_path !== null
            }
          }).slice(0, 15);
          this.trendingData[this.defaultMediaType.type] = this.searchList;
        }
      } catch (error) {
        this.loading = false;
        this.isShownSearchList = false;
        throw error.message
      }
    },

    selectMediaType(media) {
      this.defaultMediaType = media;
      this.isShownSearchList = false;
      this.getList()
    },

    getList() {
      if (this.searchText.length > 2) {
        this.search();
      } else {
        this.getTrendingData();
      }
    },

    debounceInput: _.debounce(function () {
      this.search();
    }, 350),

    async search() {
      if (this.searchText.length < 3) return;
      if (this.searchValue[this.defaultMediaType.type].name === this.defaultMediaType.type + '-' + this.searchText) {
        this.searchList = this.searchValue[this.defaultMediaType.type].data
        this.isShownSearchList = true;
        return
      }
      this.loading = true;
      try {
        let response = await api.getSearch(this.defaultMediaType.type, this.searchText)
        if (response.request.status === 200) {
          this.searchList = response.data.results.filter(item => {
            if (this.defaultMediaType.id === 3) {
              return item.profile_path !== null
            } else {
              return item.poster_path !== null
            }
          }).slice(0, 5);
          this.searchValue[this.defaultMediaType.type].name = this.defaultMediaType.type + '-' + this.searchText;
          this.searchValue[this.defaultMediaType.type].data = this.searchList;
          this.isShownSearchList = true;
          this.loading = false;
          this.clicked = true;
        }
      } catch (error) {
        this.loading = false;
        this.isShownSearchList = false;
        this.clicked = false;
        throw error.message;
      }
    },

    hideList(event) {
      let listElement = document.getElementById('search-list')
      let searchBox = document.querySelector('#search input')
      let searchNavBar = document.querySelector('#search-nav-bar')
      if (event.target !== searchBox && event.target !== listElement && event.srcElement.parentElement !== searchNavBar) {
        this.isShownSearchList = false;
      }
    },

    route(media, id) {
      this.$store.commit('routeToClicked', {path: media, query: id})
    }
  }
}
</script>
<style lang="scss">
/* width */
#search-list::-webkit-scrollbar {
  width: 10px;
}

/* Track */
#search-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
#search-list::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
#search-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
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
