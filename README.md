# Movie Land

**[Live site](https://developerdii.github.io/movie-land/)**

Movie Land is a web app for browsing movies, TV shows and people. Search, filter, open any title for its cast, photos and recommendations, and see what is popular right now. It is built with Vue 3 and Vite, and its data comes from [The Movie Database (TMDB)](https://www.themoviedb.org/).

## Features

- **Home:** a hero of popular movies, then Coming Soon, Popular Movies, Popular TV Shows and Top Rated Movies carousels.
- **Search:** press `Ctrl K` or `⌘K` (or click Search in the navbar) to find movies, TV shows and people in a panel that opens over the page.
- **Browse:** filter movies or TV shows by genre, year, country, language, rating, runtime, number of votes and sort order. Every filter lives in the page address, so a search can be shared as a link.
- **Details:** movies, TV shows and people, with cast and crew, recommendations, a photo viewer, biographies and filmographies.
- **Bookmarks:** bookmark movies, TV shows and people from their pages or from the hero. The Bookmarks page lists them in grids or lists, and the home page adds sections based on your newest bookmarks.
- **Dark mode:** switch from the navbar. The choice is saved in your browser.
- **Responsive:** the layout works on phones, tablets and desktops.

## Getting started

```bash
npm install
```

Create a `.env.local` file with your TMDB API Read Access Token (see `.env.example`):

```
VITE_TMDB_ACCESS_TOKEN=your_tmdb_api_read_access_token
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint with no warnings allowed |
| `npm run lint:fix` | Fixes what ESLint can fix automatically |

## Project structure

- `src/api.js`: the only module that calls TMDB.
- `src/components/`, `src/views/`: the UI, one view per route.
- `src/utils/`: pure helpers for dates, images, browse filters and similar.
- `src/assets/scss/app.scss`: global styles and the colour tokens, including dark mode.
- `.clinerules/`: project notes on architecture, coding conventions and the TMDB data model.

## Deployment

GitHub Actions builds and deploys the site to GitHub Pages whenever `main` changes (see `.github/workflows/deploy.yml`). In the repository settings, Pages must use the "GitHub Actions" source. The deploy workflow sets a read-only TMDB token, so no repository secret is needed.

## Data and attribution

This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

- The notice and the TMDB logo appear on the About page, which the info icon in the navbar opens from every page. The logo links to [themoviedb.org](https://www.themoviedb.org/).
- Movie Land is a personal, non-commercial project. It has no ads, no accounts and no paid features. TMDB's terms do not allow commercial use without a separate agreement, so keep it that way.
- The app keeps no TMDB data in local storage or on a server. On your device it saves only the dark mode choice and the bookmarks, and bookmarks are TMDB ids only; titles are fetched from TMDB when they are shown. TMDB's terms limit how long data may be cached (six months at most), so do not add persistent caching without checking them.
- Titles, posters, backdrops and photos belong to their rights holders. The app does not use TMDB data for AI or machine learning.
- The full terms are in TMDB's [API terms of use](https://www.themoviedb.org/api-terms-of-use).
