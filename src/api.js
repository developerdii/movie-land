import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ parent: '#app' })
NProgress.configure({ showSpinner: false })

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`
  }
})

api.interceptors.request.use(config => {
  NProgress.start()
  return config
})

api.interceptors.response.use(
  response => {
    NProgress.done()
    return response
  },
  error => {
    NProgress.done()
    return Promise.reject(error)
  }
)

export default {
  // Movies — v3 read-only
  getPopularMovies() {
    return api.get('/movie/popular')
  },

  getMovieGenres() {
    return api.get('/genre/movie/list')
  },

  getTvGenres() {
    return api.get('/genre/tv/list')
  },

  getLanguages() {
    return api.get('/configuration/languages')
  },

  getCountries() {
    return api.get('/configuration/countries')
  },

  getTrendingMovies(mediaType, timeWindow) {
    return api.get(`/trending/${mediaType}/${timeWindow}`)
  },

  getSearch(mediaType, searchText, page = 1) {
    return api.get(`/search/${mediaType}`, { params: { query: searchText, page } })
  },

  // Browse: filtered, sorted lists. mediaType is 'movie' or 'tv'.
  getDiscover(mediaType, params) {
    return api.get(`/discover/${mediaType}`, { params })
  },

  getUpComing(fromDate) {
    return api.get('/discover/movie', {
      params: {
        'primary_release_date.gte': fromDate,
        'with_runtime.gte': 60,
        sort_by: 'popularity.desc'
      }
    })
  },

  getMovieDetails(movieId) {
    return api.get(`/movie/${movieId}`)
  },

  getMovieCredits(movieId) {
    return api.get(`/movie/${movieId}/credits`)
  },

  getRecommendationsMovies(movieId) {
    return api.get(`/movie/${movieId}/recommendations`)
  },

  // People
  getPersonDetails(personId) {
    return api.get(`/person/${personId}`)
  },

  getPersonMovieCredits(personId) {
    return api.get(`/person/${personId}/movie_credits`)
  },

  getPersonTvCredits(personId) {
    return api.get(`/person/${personId}/tv_credits`)
  },

  getPopularPeople(page = 1) {
    return api.get('/person/popular', { params: { page } })
  },

  // TV
  getTvDetails(tvId) {
    return api.get(`/tv/${tvId}`)
  },

  getTvCredits(tvId) {
    return api.get(`/tv/${tvId}/credits`)
  },

  getTvAggregateCredits(tvId) {
    return api.get(`/tv/${tvId}/aggregate_credits`)
  },

  getTvRecommendations(tvId) {
    return api.get(`/tv/${tvId}/recommendations`)
  }
}

