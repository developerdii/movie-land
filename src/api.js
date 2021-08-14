import axios from 'axios';
import vueConfig from '././vue.config'


let token = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OTYxOGM1MmJmYTRkMDg3M2E1OTQ1YzZmNDI3ODU5MyIsInN1YiI6IjYwZWIzYzg1MTQwYmFkMDA3MzJhZGNiMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vFdHQnOomnHwXEGPBdNp-5dGJ-s4AzdpnXgTTO6P_Lc'

let headers = {
    'Authorization': token
}

axios.defaults.baseURL = vueConfig.publicPath
axios.defaults.headers.common = headers

export default {
    getPopularMovies() {
        return axios.get('movie/popular')
    },

    getTrendingMovies(mediaType, timeWindow) {
        return axios.get(`/trending/${mediaType}/${timeWindow}`)
    },

    getSearch(mediaType, searchText) {
        return axios.get(`/search/${mediaType}?query=${searchText}`)
    },

    getUpComing() {
        return axios.get(`/movie/upcoming`)
    },
}