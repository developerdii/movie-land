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
  getPopularMovies() {
    return api.get('/movie/popular')
  },

  getTrendingMovies(mediaType, timeWindow) {
    return api.get(`/trending/${mediaType}/${timeWindow}`)
  },

  getSearch(mediaType, searchText) {
    return api.get(`/search/${mediaType}`, { params: { query: searchText } })
  },

  getUpComing() {
    return api.get('/movie/upcoming')
  },

  getMovieDetails(movieId) {
    return api.get(`/movie/${movieId}`)
  },

  getMovieCredits(movieId) {
    return api.get(`/movie/${movieId}/credits`)
  },

  getRecommendationsMovies(movieId) {
    return api.get(`/movie/${movieId}/recommendations`)
  }
}

