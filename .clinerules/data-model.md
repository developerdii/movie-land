# Data Model (TMDB API)

MovieLand has no local persistence — all data comes from TMDB. This file documents the API surface the app depends on.

## Auth
- `src/api.js` sets `Authorization: Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` (a TMDB v4 API Read Access Token).
- Provide the token in `.env.local` (local dev). For CI/deploy, the read-only public token is embedded directly in `.github/workflows/deploy.yml`. See `.env.example`.

## Base URLs
- API: `https://api.themoviedb.org/3/`
- Images: `https://image.tmdb.org/t/p/{size}{path}` — `w500` for posters, `original` for backdrops.

## API versioning
- **v3** (`/3/`) — read-only data (movies, TV, people, search, trending). This is the current standard and what MovieLand uses.
- **v4** (`/4/`) — account/user data. MovieLand implements favorites + watchlist via the **v3 account endpoints** (`/3/account/...`) with `session_id` auth — the current documented approach for account features.
- **v2** — deprecated and removed years ago; there is no v2 to migrate from.

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

### Auth & account (session_id)
| Method | Endpoint | Used by |
| --- | --- | --- |
| `createRequestToken` | `GET /authentication/token/new` | `auth.startLogin` |
| `createSession(token)` | `POST /authentication/session/new` | `auth.completeLogin` |
| `deleteSession(id)` | `DELETE /authentication/session` | `auth.logout` |
| `getAccount(session)` | `GET /account` | `auth.loadAccount` (returns `id` = account_id) |
| `getFavoriteMovies` | `GET /account/{id}/favorite/movies` | `Favorites` |
| `getWatchlistMovies` | `GET /account/{id}/watchlist/movies` | `Watchlist` |
| `markFavorite` | `POST /account/{id}/favorite` | `MovieDetails` |
| `addToWatchlist` | `POST /account/{id}/watchlist` | `MovieDetails` |

## Response shapes (fields the UI relies on)
- List endpoints return `{ results: [...] }` with items:
  - movie: `id`, `title`, `poster_path`, `backdrop_path`, `release_date`, `overview`, `vote_average`, `genre_ids`.
  - tv: `id`, `name`, `poster_path`, `first_air_date`, `overview`.
  - person: `id`, `name`, `profile_path`, `popularity`, `media_type`.
- `getMovieDetails` returns a movie object incl. `genres: [{id, name}]`, `tagline`, `overview`, `release_date`, `vote_average`.
- `getMovieCredits` returns `{ cast: [...] }` with `name`, `character`, `profile_path`.

## Domain conventions
- Sliders chunk results into pages of **6** with `chunk(results, 6)` (from `@/utils/collection`).
- Search drops results with null `poster_path` (movie/tv) or `profile_path` (person); caps at 15 (trending) / 5 (search).
