# Data Model (TMDB API)

MovieLand has no local persistence — all data comes from TMDB. This file documents the complete TMDB API surface the app depends on, so future work does not require re-researching the API.

## Auth
- `src/api.js` sets `Authorization: Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` (a TMDB **API Read Access Token**, a v4 JWT).
- Provide the token in `.env.local` (local dev). For CI/deploy, the read-only public token is embedded directly in `.github/workflows/deploy.yml`. See `.env.example`.

## Base URLs
- API: `https://api.themoviedb.org/3/` (v3 — read-only data).
- Images: `https://image.tmdb.org/t/p/{size}{path}` — `w500` for posters/profiles, `original` for backdrops. Other sizes: `w92`, `w185`, `w342`, `w780`.

## API versioning
- **v3** (`/3/`) — read-only data (movies, TV, people, search, trending, discover). Current standard; this is all MovieLand uses.
- **v4** (`/4/`) — account/user data (favorites, watchlist, ratings, lists); requires user auth (session/access token). Not used by MovieLand.
- **v2** — deprecated/removed years ago; there is no v2.

## Endpoints (via `src/api.js`)
| Method | Endpoint | Used by |
| --- | --- | --- |
| `getPopularMovies()` | `GET /movie/popular` | `PopularMoviesSlider` |
| `getTrendingMovies(mediaType, timeWindow)` | `GET /trending/{media_type}/{time_window}` | `SearchBar` (default list) |
| `getSearch(mediaType, searchText)` | `GET /search/{media_type}?query={text}` | `SearchBar` |
| `getUpComing(fromDate)` | `GET /discover/movie` (see Discover below) | `UpComing` |
| `getMovieDetails(movieId)` | `GET /movie/{id}` | `MovieDetails` |
| `getMovieCredits(movieId)` | `GET /movie/{id}/credits` | `MovieDetails` |
| `getRecommendationsMovies(movieId)` | `GET /movie/{id}/recommendations` | `MovieDetails` |
| `getPersonDetails(personId)` | `GET /person/{id}` | `PersonDetails` |
| `getPersonMovieCredits(personId)` | `GET /person/{id}/movie_credits` | `PersonDetails` |
| `getPersonTvCredits(personId)` | `GET /person/{id}/tv_credits` | `PersonDetails` |
| `getTvDetails(tvId)` | `GET /tv/{id}` | `TvDetails` |
| `getTvCredits(tvId)` | `GET /tv/{id}/credits` | `TvDetails` |
| `getTvRecommendations(tvId)` | `GET /tv/{id}/recommendations` | `TvDetails` |

## Discover (filtered movie queries)
`getUpComing(fromDate)` uses the discover endpoint instead of `/movie/upcoming` (which returns past-dated movies):
```
GET /discover/movie?primary_release_date.gte={fromDate}&with_runtime.gte=60&sort_by=popularity.desc
```
- `primary_release_date.gte` — only movies released on/after the given date (YYYY-MM-DD).
- `with_runtime.gte=60` — exclude short films (the "4 min runtime" problem).
- `sort_by=popularity.desc` — most popular / mainstream upcoming films first.
Other useful discover params: `sort_by=primary_release_date.asc`, `vote_average.gte`, `with_genres`, `with_original_language`, `primary_release_date.lte`.

## Search media types
`getSearch(mediaType, ...)` accepts `movie`, `tv`, `person` (and `multi`). Single-type search omits `media_type` on items; multi-search includes it.

## Response shapes (fields the UI relies on)
- List endpoints return `{ page, results: [...], total_pages, total_results }`:
  - movie: `id`, `title`, `poster_path`, `backdrop_path`, `release_date`, `overview`, `vote_average`, `genre_ids`, `runtime`.
  - tv: `id`, `name`, `poster_path`, `first_air_date`, `overview`, `vote_average`, `number_of_seasons`, `episode_run_time`.
  - person: `id`, `name`, `profile_path`, `popularity`, `known_for_department`.
- `getMovieDetails` adds `genres: [{id, name}]`, `tagline`, `runtime`, `original_language`.
- `getTvDetails` adds `genres`, `tagline`, `number_of_seasons`, `episode_run_time`, `first_air_date`.
- `getPersonDetails` adds `biography`, `birthday`, `known_for_department`, `popularity`.
- Credits return `{ cast: [...] }` with `name`, `character`, `profile_path`.
- Person search results may carry `known_for: [...]`.

## Domain conventions
- Sliders chunk results into pages of **6** with `chunk(results, 6)` (`@/utils/collection`); the cast slider uses **4**.
- Search drops results with null `poster_path` (movie/tv) or `profile_path` (person); caps at 15 (trending) / 5 (search).
- Dates via `formatDate(date, format)` from `@/utils/date` — supports `'YYYY'` and `'MMM Do YY'`.
- Lists are paginated client-side with `usePagination(items, pageSize)` (`@/composables/usePagination`) + `PaginationControls`; no `.slice()` limits anywhere.

