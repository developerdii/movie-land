---
name: release-to-main
description: Build and ship a release to production. Use when the user asks to deploy, release, publish, push the site, "yayınla", "deploy et", "gh-pages", or "main'e birleştir".
---

# Release to Production

Production is the `main` branch. A push to `main` triggers `.github/workflows/deploy.yml` and deploys to GitHub Pages. Follow this checklist whenever a release / deploy is requested.

## 1. Validate
```bash
npm run build       # production build must succeed
```

## 2. Commit and publish the working branch
- Keep all application work on `develop`.
- Commit the reviewed release changes on `develop` with a Conventional Commit message.
- Push `develop` to `origin` and ensure lint/build CI passes.

## 3. Merge to production
- Fetch the latest remote refs and confirm the working tree is clean.
- Fast-forward `main` to `develop`; stop and resolve divergence instead of creating a merge commit.
- Push `main` to `origin` to trigger the GitHub Pages deploy, then return to `develop`.

## 4. Verify & report
- Confirm the GitHub Actions deployment completes and the site updates at https://developerdii.github.io/movie-land/.
- Report the released commit hash and what changed.
