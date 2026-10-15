# Architecture

Unidirectional data flow:
```
components → api.js (axios instance) → TMDB API (https://api.themoviedb.org/3/)
```

## Layers
- **`src/api.js`** — the ONLY network/TMDB seam. A dedicated axios instance (`baseURL`, `Authorization: Bearer ${VITE_TMDB_ACCESS_TOKEN}`) with NProgress interceptors; all TMDB methods are listed in `data-model.md`.
- **`src/components/`**:
  - `Navbar` — sticky nav, hosts `SearchBar`.
  - `SearchBar` — debounced (350 ms) search across movie/tv/person with client-side caching (`searchValue`, `trendingData`) and a responsive fixed result panel.
  - `Slider` — reusable Bootstrap carousel shell (slots `title` and `card`); props `showIndicators` (dots) and `showPosition` ("N / M" badge); initializes its `Carousel` in `onMounted()` (manual nav only).
  - `MovieSlider` — renders `Slider` with chunked rows of 6 movies.
  - `PopularMoviesSlider` — hero carousel from `movie/popular`; auto-cycles and pauses on hover.
  - `UpComing` — wraps `MovieSlider` with upcoming movies from the discover endpoint (see `data-model.md`).
  - `Rating` — renders `vote_average` as `x.x / 10`.
- **`src/views/`** — route pages: `Home` (`PopularMoviesSlider` + `UpComing`), `MovieDetails`, `TvDetails`, `PersonDetails`. Detail pages share `.detail-page` and `.detail-content`; film and TV metadata stays in the heading row, and profile photos are not reused as backdrops.
- **`src/utils/`** — pure helpers: `date.js` (`formatDate`), `language.js` (`getLanguageName`), and `collection.js` (`chunk`, `debounce`).
- **`src/composables/usePagination.js`** — `usePagination(items, pageSize)` for client-side list pagination.
- **`src/components/PaginationControls.vue`** — prev/next + "page X / Y" pagination controls.

## Rules of thumb
- All TMDB calls go through `src/api.js`; never inline axios/fetch in components.
- Carousel components initialize their own `Carousel` instance in `onMounted()` (don't rely on `data-bs-ride`).
- Navigation uses `useRouter().push({ path, query: { id } })`; the detail page keeps the `?id=` convention.
- Keep date formatting in `src/utils/date.js`.
