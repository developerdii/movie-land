# Data Model (TMDB API)

MovieLand has no local persistence — all data comes from TMDB. This file documents the API surface the app depends on.

## Auth
- `src/api.js` sets `Authorization: Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` (a TMDB v4 API Read Access Token).
- Provide the token in `.env.local` (local) and as the `VITE_TMDB_ACCESS_TOKEN` GitHub Actions secret (CI/deploy). See `.env.example`.

## Base URLs
- API: `https://api.themoviedb.org/3/`
- Images: `https://image.tmdb.org/t/p/{size}{path}` — `w500` for posters, `original` for backdrops.

## Endpoints (via `src/api.js`)
| Method | Endpoint | Used by |
| --- | --- | --- |
| `getPopularMovies` | `GET /movie/popular` | `PopularMoviesSlider` |
| `getTrendingMovies(mediaType, timeWindow)` | `GET /trending/{media_type}/{time_window}` | `SearchBar` (default list) |
| `getSearch(mediaType, searchText)` | `GET /search/{media_type}?query={text}` | `SearchBar` |
| `getUpComing` | `GET /movie/upcoming` | `UpComing` |
| `getMovieDetails(movieId)` | `GET /movie/{id}` | `MovieDetails` |
| `getMovieCredits(movieId)` | `GET /movie/{id}/credits` | `MovieDetails` |
| `getRecommendationsMovies(movieId)` | `GET /movie/{id}/recommendations` | `MovieDetails` |

## Response shapes (fields the UI relies on)
- List endpoints return `{ results: [...] }` with items:
  - movie: `id`, `title`, `poster_path`, `backdrop_path`, `release_date`, `overview`, `vote_average`, `genre_ids`.
  - tv: `id`, `name`, `poster_path`, `first_air_date`, `overview`.
  - person: `id`, `name`, `profile_path`, `popularity`, `media_type`.
- `getMovieDetails` returns a movie object incl. `genres: [{id, name}]`, `tagline`, `overview`, `release_date`, `vote_average`.
- `getMovieCredits` returns `{ cast: [...] }` with `name`, `character`, `profile_path`.

## Domain conventions
- Sliders chunk results into pages of **6** with `_.chunk(results, 6)`.
- Search drops results with null `poster_path` (movie/tv) or `profile_path` (person); caps at 15 (trending) / 5 (search).
