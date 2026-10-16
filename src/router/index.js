import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { BROWSE_TYPES } from '../utils/browse'

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
  },
  {
    // Filterable lists. Not linked from the navbar or home page: reached from
    // the search "Browse all" link and from genre tags on detail pages.
    path: '/browse/:type',
    name: 'Browse',
    component: () => import('../views/BrowseView.vue')
  }
]

// Hash history is used so deep links (e.g. /movie?id=123) work on static
// hosting like GitHub Pages, which has no server-side SPA fallback.
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Checked on every navigation: a route-level beforeEnter does not run when only
// the :type param changes (e.g. /browse/movie -> /browse/banana).
router.beforeEach((to) => {
  if (to.name === 'Browse' && !BROWSE_TYPES.includes(to.params.type)) return { path: '/browse/movie' }
})

export default router

