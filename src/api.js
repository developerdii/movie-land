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

  getTrendingMovies(mediaType, timeWindow) {
    return api.get(`/trending/${mediaType}/${timeWindow}`)
  },

  getSearch(mediaType, searchText) {
    return api.get(`/search/${mediaType}`, { params: { query: searchText } })
  },

  getUpComing(fromDate) {
    return api.get('/discover/movie', {
      params: {
        'primary_release_date.gte': fromDate,
        sort_by: 'primary_release_date.asc'
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

  // TV
  getTvDetails(tvId) {
    return api.get(`/tv/${tvId}`)
  },

  getTvCredits(tvId) {
    return api.get(`/tv/${tvId}/credits`)
  },

  getTvRecommendations(tvId) {
    return api.get(`/tv/${tvId}/recommendations`)
  }
}

