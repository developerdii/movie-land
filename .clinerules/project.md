# Project Overview

**MovieLand** — a Vue 3 SPA for browsing movies & TV via the TMDB API. The home page shows a hero carousel of popular movies plus an "upcoming" slider; a navbar search covers movies / TV / people; a movie detail page shows details, credits and recommendations.

## Tech stack
Vue 3 (Options API) · Vite · Pinia · Vue Router 4 (hash history) · axios · Bootstrap 5 (npm) · Bootstrap Icons · Sass · moment · lodash · NProgress · ESLint (flat config, `eslint-plugin-vue`).

## Commands
```bash
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # ESLint (Vue 3 recommended, --max-warnings=0)
npm run lint:fix   # ESLint autofix
```

## Key facts
- Router uses **hash history** (`createWebHashHistory`) so deep links work on static hosting (GitHub Pages).
- Routes: `/` (Home), `/movie?id={id}` (MovieDetails).
- TMDB auth comes from `VITE_TMDB_ACCESS_TOKEN` (see `.env.example`); `src/api.js` owns the axios instance, base URL and NProgress interceptors.
- `public/service-worker.js` is a one-off cleanup worker that removes the old Vue CLI PWA service worker (which cached the previous site).
- Live: https://developerdii.github.io/movie-land/
