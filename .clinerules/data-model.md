# Data Model (TMDB API)

MovieLand has no local persistence — all data comes from TMDB. This file documents the complete TMDB API surface the app depends on, so future work does not require re-researching the API.

## Auth
- `src/api.js` sets `Authorization: Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` (a TMDB **API Read Access Token**, a v4 JWT).
- Provide the token in `.env.local` (local dev). For the deploy workflow, the read-only public token is embedded directly in `.github/workflows/deploy.yml` (no repo secret). See `.env.example`.

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
| `getMovieGenres()` | `GET /genre/movie/list` | `SearchBar` (genre tags), `PopularMoviesSlider` (hero genre) |
| `getTvGenres()` | `GET /genre/tv/list` | `SearchBar` (genre tags) |
| `getTrendingMovies(mediaType, timeWindow)` | `GET /trending/{media_type}/{time_window}` | `SearchBar` (default list) |
| `getSearch(mediaType, searchText, page)` | `GET /search/{media_type}?query={text}&page={n}` | `SearchBar`, `BrowseView` (when a search text is set) |
| `getDiscover(mediaType, params)` | `GET /discover/{media_type}` (movie or tv) | `BrowseView` |
| `getUpComing(fromDate)` | `GET /discover/movie` (see Discover below) | `UpComing` |
| `getMovieDetails(movieId)` | `GET /movie/{id}` | `MovieDetails` |
| `getMovieCredits(movieId)` | `GET /movie/{id}/credits` | `MovieDetails` |
| `getRecommendationsMovies(movieId)` | `GET /movie/{id}/recommendations` | `MovieDetails` |
| `getPersonDetails(personId)` | `GET /person/{id}` | `PersonDetails` |
| `getPersonMovieCredits(personId)` | `GET /person/{id}/movie_credits` | `PersonDetails` |
| `getPersonTvCredits(personId)` | `GET /person/{id}/tv_credits` | `PersonDetails` |
| `getPopularPeople(page)` | `GET /person/popular` | `BrowseView` (people, no search text) |
| `getTvDetails(tvId)` | `GET /tv/{id}` | `TvDetails` |
| `getTvCredits(tvId)` | `GET /tv/{id}/credits` | `TvDetails` |
| `getTvAggregateCredits(tvId)` | `GET /tv/{id}/aggregate_credits` | `TvDetails` (writers) |
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
- `getTvDetails` adds `genres`, `tagline`, `number_of_seasons`, `number_of_episodes`, `episode_run_time`, `first_air_date`, `last_air_date`, `status`, `created_by`.
- `getPersonDetails` adds `biography`, `birthday`, `deathday`, `place_of_birth`, `known_for_department`, `popularity`.
- Credits return `{ cast: [...] }` with `name`, `character`, `profile_path`.
- Person search results may carry `known_for: [...]`.

## Browse (filtered lists)
`/browse/:type` (`movie`, `tv`, `person`) is a full-page, server-paged list. The URL is its only state:
- Query params: `q` (search text), `genre` (one genre id), `year`, `sort` (default `popularity.desc`; also `release_date.*` and `vote_average.*`), `page` (1-based). Only non-default values are written, so the default view is `/browse/{type}`.
- Movies and TV use `getDiscover`. `sort` maps per type: `release_date` → `primary_release_date` (movie) or `first_air_date` (TV). `year` maps to `primary_release_year` (movie) or `first_air_date_year` (TV). Rating sort adds `vote_count.gte=100` so unrated titles don't float to the top.
- People use `getPopularPeople` (`/person/popular`). It has no sort, filter or direction parameters, so people only get the default popularity order and the search text. The filter panel shows no genre, year or sort for people.
- A search text uses `getSearch` (`/search/{type}`), which ignores genre, year and sort. While `q` is set the filter controls are disabled.
- TMDB returns 20 results per page and stops at page 500. The view caps `total_pages` at 500. Movie and TV rows without a `poster_path` are dropped, as in search.
- Entry points: a genre tag on a movie or TV detail page opens `/browse/{movie|tv}?genre={id}`. The search footer's "Browse all" opens `/browse/{active tab}` with `q` when the search box has text, and shows popular results otherwise.

## Domain conventions
- Sliders chunk results into pages of **6** with `chunk(results, 6)` (`@/utils/collection`); recommendation/upcoming lists are trimmed with `trimToChunks(results, 6)` first so the last slide is never partial. The `MediaSection` grid paginates **6** per page and its list view **12** per page.
- Search drops results with null `poster_path` (movie/tv); people without a `profile_path` fall back to an initials tile. Lists cap at 15 (trending) / 5 (search); tab counts use `total_results` (search) or list length (trending). Movie/tv rows show a genre tag (mapped from `genre_ids` via `/genre/{movie,tv}/list`); person rows show `known_for_department` and `popularity`.
- Dates via `formatDate(date, format)` from `@/utils/date` — supports `'YYYY'`, `'MMM D, YYYY'`, and `'ddd, MMM D, YYYY'`.
- Lists are paginated client-side by `MediaSection` (its own `page`/`pageSize` state + round pagination controls). `usePagination` + `PaginationControls` are legacy and currently unused.

