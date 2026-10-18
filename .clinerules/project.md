# Project Overview

**MovieLand** — a Vue 3 SPA for browsing movies & TV via the TMDB API. The home page shows a hero carousel of popular movies plus an "upcoming" slider; a navbar search covers movies / TV / people; a movie detail page shows details, credits and recommendations.

## Tech stack
Vue 3 (Composition API, `<script setup>`) · Vite · Pinia (installed and set up in `src/main.js`, no stores yet) · Vue Router 4 (hash history) · axios · Bootstrap 5 (npm) · Bootstrap Icons · Sass · NProgress · ESLint (flat config, `eslint-plugin-vue`).

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
- Routes: `/` (Home), `/about` (About), `/movie?id={id}` (MovieDetails), `/tv?id={id}` (TvDetails), `/person?id={id}` (PersonDetails), `/bookmarks/{movie|tv|person}` (BookmarksView; `/bookmarks` opens the first type with saved titles), `/browse/{movie|tv|person}` (BrowseView; query params `q`, `genre`, `year`, `language`, `country`, `rating`, `maxRating`, `runtime`, `minVotes`, `maxVotes`, `sort`, `page`). The navbar Browse button links to `/browse/movie`; the home page has no browse link.
- TMDB auth comes from `VITE_TMDB_ACCESS_TOKEN` (see `.env.example`); `src/api.js` owns the axios instance, base URL and NProgress interceptors.
- Dark mode: the navbar toggle sets `data-theme` on `<html>` and saves `movieland-theme` in localStorage (default light). See `coding.md` → Dark mode.
- Bookmarks: movie, TV and person ids in localStorage (`movieland-bookmarks`), nothing else; see `data-model.md` → Bookmarks.
- Recently viewed: the last eighteen movie, TV and person ids in localStorage (`movieland-recent`); the home page shows them in a slider of six per page, once there are six. See `data-model.md` → Recently viewed.
- Born today: the day's birthday list is saved as TMDB person ids with the date (`movieland-born-today`). Its lookup asks Wikidata for today's birthdays, once a day; see `data-model.md` → Born today.
- Search: a navbar trigger opens a centered Spotlight-style panel (⌘K / Ctrl+K from anywhere).
- `public/service-worker.js` is a one-off cleanup worker that removes the old Vue CLI PWA service worker (which cached the previous site).
- Live: https://developerdii.github.io/movie-land/
