import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { BROWSE_TYPES } from '../utils/browse'
import { BOOKMARK_TYPES, firstBookmarkedType } from '../composables/useBookmarks'

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
    // Filterable lists. Reached from the navbar Browse button, the search "Browse all" link
    // and genre tags on detail pages.
    path: '/browse/:type',
    name: 'Browse',
    component: () => import('../views/BrowseView.vue')
  },
  {
    // Saved titles, by type. /bookmarks alone opens the first type that has saved titles.
    path: '/bookmarks/:type?',
    name: 'Bookmarks',
    component: () => import('../views/BookmarksView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    // Short page: the card gets narrower and its height follows the text (see .router-view--compact).
    meta: { compactCard: true }
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
  if (to.name === 'Bookmarks' && !BOOKMARK_TYPES.includes(to.params.type)) return { path: '/bookmarks/' + firstBookmarkedType() }
})

export default router

