# Git Workflow

This repo uses a `develop` → `main` flow. `main` is production — pushing to it triggers the GitHub Pages deploy.

## Branches
- All work happens on **`develop`**.
- **Never push directly to `main`.** Merge `develop` → `main` only when a release is requested.
- `main` triggers `.github/workflows/deploy.yml` (build + deploy to GitHub Pages via Actions).
- Remote: `origin` → `github.com:developerdii/movie-land.git`.

## Commits & pushes
- Conventional prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One logical change per commit.
- Push only to `origin develop`.
- Before finishing a task, run `npm run lint` and `npm run build`; both must pass.

## CI pipeline
- `.github/workflows/ci.yml` runs on every push to `develop` and every PR targeting `main` / `develop` (lint + build).
- `.github/workflows/deploy.yml` runs on push to `main` (build with the `VITE_TMDB_ACCESS_TOKEN` secret + deploy to Pages).

## Required GitHub settings (one-time)
- Repo → Settings → Pages → Source = **GitHub Actions** (replaces the old `gh-pages` branch deploy).
- Add the `VITE_TMDB_ACCESS_TOKEN` secret (read-only TMDB token).
- Set the default branch to `main` (or `develop`).
- (Optional) Enable branch protection on `main` requiring the `CI` status check.

## Keep `.clinerules/` in sync
- `.clinerules/*.md` is the living source of truth for how I understand this project. Keep it accurate.
- Whenever the app changes (new endpoint, component, route, tech stack, or convention), update the relevant `.clinerules/*.md` file **in the same change**.
