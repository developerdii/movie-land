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

  getTopRatedMovies() {
    return api.get('/movie/top_rated')
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

  getPopularTv() {
    return api.get('/tv/popular')
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

  // Images: English and language-less only, so the galleries are not full of other-language artwork.
  getMovieImages(movieId) {
    return api.get(`/movie/${movieId}/images`, { params: { include_image_language: 'en,null' } })
  },

  // append_to_response adds the US certification (release_dates) to the same response.
  getMovieDetails(movieId) {
    return api.get(`/movie/${movieId}`, { params: { append_to_response: 'release_dates' } })
  },

  getMovieCredits(movieId) {
    return api.get(`/movie/${movieId}/credits`)
  },

  getRecommendationsMovies(movieId) {
    return api.get(`/movie/${movieId}/recommendations`)
  },

  // People
  getPersonImages(personId) {
    return api.get(`/person/${personId}/images`)
  },

  // Photos of the person tagged in films and TV episodes, paged.
  getPersonTaggedImages(personId, page = 1) {
    return api.get(`/person/${personId}/tagged_images`, { params: { page } })
  },

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
  getTvImages(tvId) {
    return api.get(`/tv/${tvId}/images`, { params: { include_image_language: 'en,null' } })
  },

  // append_to_response adds the US content rating (content_ratings) to the same response.
  getTvDetails(tvId) {
    return api.get(`/tv/${tvId}`, { params: { append_to_response: 'content_ratings' } })
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

