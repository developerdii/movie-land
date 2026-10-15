# Architecture

Unidirectional data flow:
```
components → api.js (axios instance) → TMDB API (https://api.themoviedb.org/3/)
```

## Layers
- **`src/api.js`** — the ONLY network/TMDB seam. A dedicated axios instance (`baseURL`, `Authorization: Bearer ${VITE_TMDB_ACCESS_TOKEN}`) with NProgress interceptors; all TMDB methods are listed in `data-model.md`.
- **`src/components/`**:
  - `AsyncImage` — shared lazy-loaded artwork frame with reserved aspect ratio and movie/person fallback icon.
  - `Navbar` — sticky nav, hosts `SearchBar`.
  - `SearchBar` — light search dropdown with a 250 ms debounced query, Movie/TV/Person tabs with per-type counts, genre (movie/TV) and department (person) tags, per-type cached trending/search results, and keyboard navigation (↑/↓/Enter/Esc).
  - `Slider` — reusable Bootstrap carousel shell (slots `title` and `card`); props `showIndicators` (dots), `showPosition` ("N / M" badge) and `showArrows` (prev/next controls); emits `slid` (`{ index, total }`); initializes its `Carousel` in `onMounted()` (manual nav only).
  - `SectionHeading` — shared section heading (eyebrow label + display title with a gold accent divider below); uses the "Big Shoulders Display" (title) and "Manrope" (eyebrow) fonts; supports an `actions` slot for heading controls.
  - `MediaSection` — reusable grid/list section (eyebrow + title heading, grid/list view toggle, round pagination); the `kind` prop (`person` | `movie` | `tv`) drives card fields and the detail route; used by Cast (film/TV details) and Filmography (person details).
  - `MovieSlider` — renders `Slider` with chunked rows of 6 items; the `type` prop (`movie` | `tv`) drives title/date fields and the detail route.
  - `PopularMoviesSlider` — hero carousel from `movie/popular`; auto-cycles and pauses on hover.
  - `UpComing` — wraps `MovieSlider` with upcoming movies from the discover endpoint (see `data-model.md`).
  - `Rating` — renders `vote_average` as `x.x / 10`.
- **`src/views/`** — route pages: `Home` (`PopularMoviesSlider` + `UpComing`), `MovieDetails`, `TvDetails`, `PersonDetails`. Detail pages share `.detail-page` and `.detail-content`; film and TV metadata stays in the heading row, and profile photos are not reused as backdrops.
- **`src/utils/`** — pure helpers: `date.js` (`formatDate`), `language.js` (`getLanguageName`), and `collection.js` (`chunk`, `debounce`).
- **`src/composables/usePagination.js`** — `usePagination(items, pageSize)` for client-side list pagination (legacy; `MediaSection` now pages internally).
- **`src/components/PaginationControls.vue`** — prev/next + "page X / Y" pagination controls (legacy; superseded by the shared `round-pagination`).

## Rules of thumb
- All TMDB calls go through `src/api.js`; never inline axios/fetch in components.
- Carousel components initialize their own `Carousel` instance in `onMounted()` (don't rely on `data-bs-ride`).
- Navigation uses `useRouter().push({ path, query: { id } })`; the detail page keeps the `?id=` convention.
- Keep date formatting in `src/utils/date.js`.
