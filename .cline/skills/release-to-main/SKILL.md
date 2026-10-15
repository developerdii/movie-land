---
name: release-to-main
description: Build and ship a release to production. Use when the user asks to deploy, release, publish, push the site, "yayınla", "deploy et", "gh-pages", or "main'e birleştir".
---

# Release to Production

Production today is the `gh-pages` branch served by GitHub Pages. Follow this checklist whenever a release / deploy is requested.

## 1. Validate
```bash
npm run build       # production build must succeed
```

## 2. Publish to gh-pages (current flow)
- Build output is in `dist/`. Publish its contents to the root of the `gh-pages` branch (commit them there, or `git subtree push --prefix dist origin gh-pages`).
- Confirm the site updates at https://developerdii.github.io/movie-land/.

## 3. After the Actions deploy lands (migration)
- Once `.github/workflows/deploy.yml` exists and the source moves to `develop` → `main`, switch this skill to the merge flow:
  ```bash
  git checkout develop
  git fetch origin
  git checkout main
  git merge --ff-only develop
  git push origin main
  git checkout develop
  ```
- `main` will be production — pushing it triggers the Pages deploy.

## 4. Verify & report
- Confirm the deployed site works (home carousel + search + a movie detail page).
- Report the released commit hash and what changed.
