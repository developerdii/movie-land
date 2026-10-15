# Architecture

Unidirectional data flow:
```
components → api.js (axios instance) → TMDB API (https://api.themoviedb.org/3/)
```

## Layers
- **`src/api.js`** — the ONLY network/TMDB seam. Creates a dedicated axios instance (`baseURL`, `Authorization: Bearer ${VITE_TMDB_ACCESS_TOKEN}`), attaches NProgress request/response interceptors, and exposes named methods: `getPopularMovies`, `getTrendingMovies(mediaType, timeWindow)`, `getSearch(mediaType, searchText)`, `getUpComing`, `getMovieDetails(id)`, `getMovieCredits(id)`, `getRecommendationsMovies(id)`.
- **`src/components/`**:
  - `Navbar` — sticky nav, hosts `SearchBar`.
  - `SearchBar` — debounced (350 ms via lodash) search across movie/tv/person with client-side caching (`searchValue`, `trendingData`).
  - `Slider` — reusable Bootstrap carousel shell (slots `title` and `card`); initializes its `Carousel` in `mounted()` (manual nav only).
  - `MovieSlider` — renders `Slider` with chunked rows of 6 movies.
  - `PopularMoviesSlider` — hero carousel from `movie/popular`; auto-cycles and pauses on hover.
  - `UpComing` — wraps `MovieSlider` with `movie/upcoming` data.
  - `Rating` — renders `vote_average` as `x.x / 10`.
- **`src/views/`** — route pages: `Home` (`PopularMoviesSlider` + `UpComing`), `MovieDetails` (details + credits + recommendations; slider/list toggle via `Enums`).
- **`src/utils/`** — pure helpers: `date.js` (`formatDate`) and `collection.js` (`chunk`, `debounce`).
- **`src/enums.js`** — frozen view-mode enum: `LIST = 1`, `SLIDER = 2`.

## Rules of thumb
- All TMDB calls go through `src/api.js`; never inline axios/fetch in components.
- Carousel components initialize their own `Carousel` instance in `onMounted()` (don't rely on `data-bs-ride`).
- Navigation uses `useRouter().push({ path, query: { id } })`; the detail page keeps the `?id=` convention.
- Keep date formatting in `src/utils/date.js`.
