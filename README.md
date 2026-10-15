# MOVIE LAND

https://developerdii.github.io/movie-land/

A Vue 3 SPA for browsing movies & TV via the TMDB API.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Preview the production build locally
```
npm run preview
```

### Lint
```
npm run lint
```

## Environment
Create a `.env.local` file with your TMDB API Read Access Token:
```
VITE_TMDB_ACCESS_TOKEN=your_tmdb_api_read_access_token
```
See `.env.example`.

## Deployment
Deployment is handled by GitHub Actions (`.github/workflows/deploy.yml`): pushing to `main` builds and deploys to GitHub Pages. Set the `VITE_TMDB_ACCESS_TOKEN` secret in the repo settings and configure Pages to use the "GitHub Actions" source.
