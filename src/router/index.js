import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/movie',
    name: 'MovieDetails',
    component: () => import('../views/MovieDetails.vue')
  },
  {
    path: '/tv',
    name: 'TvDetails',
    component: () => import('../views/TvDetails.vue')
  },
  {
    path: '/person',
    name: 'PersonDetails',
    component: () => import('../views/PersonDetails.vue')
  }
]

// Hash history is used so deep links (e.g. /movie?id=123) work on static
// hosting like GitHub Pages, which has no server-side SPA fallback.
export default createRouter({
  history: createWebHashHistory(),
  routes
})

