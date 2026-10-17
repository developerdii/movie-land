# Data Model (TMDB API)

MovieLand has no local persistence — all data comes from TMDB. This file documents the complete TMDB API surface the app depends on, so future work does not require re-researching the API.

## Auth
- `src/api.js` sets `Authorization: Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` (a TMDB **API Read Access Token**, a v4 JWT).
- Provide the token in `.env.local` (local dev). For the deploy workflow, the read-only public token is embedded directly in `.github/workflows/deploy.yml` (no repo secret). See `.env.example`.

## Base URLs
- API: `https://api.themoviedb.org/3/` (v3 — read-only data).
- Images: `https://image.tmdb.org/t/p/{size}{path}` — `w500` for posters/profiles, `original` for backdrops. Other sizes: `w92`, `w185`, `w342`, `w780`.

## API versioning
- **v3** (`/3/`) — read-only data (movies, TV, people, search, discover). Current standard; this is all MovieLand uses.
- **v4** (`/4/`) — account/user data (favorites, watchlist, ratings, lists); requires user auth (session/access token). Not used by MovieLand.
- **v2** — deprecated/removed years ago; there is no v2.

## Endpoints (via `src/api.js`)
| Method | Endpoint | Used by |
| --- | --- | --- |
| `getPopularMovies()` | `GET /movie/popular` | `PopularMoviesSlider`, `SearchBar` (default list) |
| `getMovieGenres()` | `GET /genre/movie/list` | `SearchBar` (genre tags), `PopularMoviesSlider` (hero genre) |
| `getTvGenres()` | `GET /genre/tv/list` | `SearchBar` (genre tags) |
| `getLanguages()` | `GET /configuration/languages` | `BrowseView` (language filter) |
| `getCountries()` | `GET /configuration/countries` | `BrowseView` (country filter) |
| `getPopularTv()` | `GET /tv/popular` | `SearchBar` (default list) |
| `getSearch(mediaType, searchText, page)` | `GET /search/{media_type}?query={text}&page={n}` | `SearchBar`, `BrowseView` (when a search text is set) |
| `getDiscover(mediaType, params)` | `GET /discover/{media_type}` (movie or tv) | `BrowseView` |
| `getUpComing(fromDate)` | `GET /discover/movie` (see Discover below) | `UpComing` |
| `getMovieDetails(movieId)` | `GET /movie/{id}` | `MovieDetails` |
| `getMovieCredits(movieId)` | `GET /movie/{id}/credits` | `MovieDetails` |
| `getRecommendationsMovies(movieId)` | `GET /movie/{id}/recommendations` | `MovieDetails` |
| `getPersonDetails(personId)` | `GET /person/{id}` | `PersonDetails` |
| `getPersonMovieCredits(personId)` | `GET /person/{id}/movie_credits` | `PersonDetails` |
| `getPersonTvCredits(personId)` | `GET /person/{id}/tv_credits` | `PersonDetails` |
| `getPopularPeople(page)` | `GET /person/popular` | `BrowseView` (people, no search text), `SearchBar` (default list) |
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
- Credits return `{ cast: [...], crew: [...] }`. Person pages merge cast and crew by title id, so a film is listed once even when the person acted and also worked behind the camera. The filmography and the "Credits" count (unique movies plus unique TV shows) both use the merged list. Christopher Nolan (id 525) has 33 cast and 78 crew movie credits, and his crew films are now included. Filmography rules (`visibleRoles` and `BADGE_PRIORITY` in PersonDetails). A film that has the person's main role (`known_for_department`) shows no roles at all, so a director's own films get no badge, and neither does a writer's written films. On every other film, the roles the person had there are shown. The grid card gets one badge, the first by priority: Directing, then Writing, then Acting. Directing comes from crew job Director, Writing from Writer, Screenplay, Story or Teleplay, Acting from cast. `PosterCard` shows the badge as a light pill, top right, the same style as the ACTING pill in the list view. Each entry also carries `allRoles` (Acting, Directing, Writing, whichever apply), which the list view shows as pills.
- Person search results may carry `known_for: [...]`.

## Images (detail pages)
- `getMovieImages(id)` and `getTvImages(id)` call `/movie/{id}/images` and `/tv/{id}/images` with `include_image_language=en,null`, so only English and language-less artwork comes back. They return `backdrops`, `posters` and `logos`. They load after the page renders and never block it. Movies have no stills in the API; TV episode stills (`/tv/{id}/season/{n}/episode/{e}/images`) are not used yet.
- `getPersonImages(id)` calls `/person/{id}/images` and returns `profiles`.
- `getPersonTaggedImages(id, page)` calls `/person/{id}/tagged_images`, which is paged. The viewer walks up to 5 pages (`MAX_TAGGED_PAGES`) on first open. Each item's `media` gives the caption.
- Sizes: backdrop in the viewer `w1280`, strip thumbnails `w500`, viewer thumbnails `w300`, posters and profiles `w780`, logos `w500`.
- The viewer lists photos sorted by TMDB score, then vote count.

## Browse (filtered lists)
`/browse/:type` (`movie`, `tv`, `person`) is a full-page, server-paged list. The URL is its only state:
- Query params: `q` (search text), `genre` (one genre id), `year`, `language` (ISO 639-1, e.g. `fr`), `country` (ISO 3166-1, e.g. `FR`), `rating` (minimum, `5`–`8`), `maxRating` (maximum, `4`–`8`), `runtime` (`short` | `medium` | `long`), `sort` (default `popularity.desc`; also `release_date.*` and `vote_average.*`), `page` (1-based). Only non-default values are written, so the default view is `/browse/{type}`.
- Movies and TV use `getDiscover`. `sort` maps per type: `release_date` → `primary_release_date` (movie) or `first_air_date` (TV). `year` maps to `primary_release_year` (movie) or `first_air_date_year` (TV). `language` → `with_original_language`, `country` → `with_origin_country`, `rating` → `vote_average.gte`, `maxRating` → `vote_average.lte`, `runtime` → `with_runtime.gte` / `with_runtime.lte` (short: lte 89; medium: 90–120; long: gte 121). Rating sort and either rating filter add `vote_count.gte=100`, so unrated titles don't float to the top or pass the filter.
- People use `getPopularPeople` (`/person/popular`). TMDB has no sort, filter or direction parameters for people, so the search field is the only filter on that page. A department filter could only work client-side on the 20 people already loaded, so it is not offered.
- A search text uses `getSearch` (`/search/{type}`), which ignores genre, year and sort. While `q` is set the filter controls are disabled.
- The search field writes `q` with `router.replace` (the history entry is replaced while typing), while every other filter pushes a new entry.
- TMDB returns 20 results per page and stops at page 500. The view caps `total_pages` at 500. Movie and TV rows without a `poster_path` are kept and show the initials placeholder, so every page stays full. (Dropping them left `popularity.asc` pages with 5 or 11 cards.)
- Entry points: a genre tag on a movie or TV detail page opens `/browse/{movie|tv}?genre={id}`. The search footer's "Browse all" opens `/browse/{active tab}` with `q` when the search box has text, and shows popular results otherwise.

## Domain conventions
- Sliders chunk results into pages of **6** with `chunk(results, 6)` (`@/utils/collection`); recommendation/upcoming lists are trimmed with `trimToChunks(results, 6)` first so the last slide is never partial. The `MediaSection` grid paginates **6** per page and its list view **12** per page.
- Search drops results with null `poster_path` (movie/tv); people without a `profile_path` fall back to an initials tile. Lists cap at 15 (default popular lists) / 5 (search); tab counts use `total_results` (search) or list length (default list). Movie/tv rows show a genre tag (mapped from `genre_ids` via `/genre/{movie,tv}/list`); person rows show `known_for_department`; in the default list they show their rank instead of `popularity`.
- Dates via `formatDate(date, format)` from `@/utils/date` — supports `'YYYY'`, `'MMM D, YYYY'`, and `'ddd, MMM D, YYYY'`.
- Lists are paginated client-side by `MediaSection` (its own `page`/`pageSize` state + round pagination controls). `usePagination` + `PaginationControls` are legacy and currently unused.

