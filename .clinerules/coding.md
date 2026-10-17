# Coding Conventions

## Vue
- Vue 3 Composition API with `<script setup>`.
- Props via `defineProps`; shared logic in `src/utils/` (or `src/composables/` for reactive logic).
- Navigation via `useRouter().push({ path, query: { id } })`.

## Styling
- Bootstrap 5 utility classes + custom SCSS in `<style lang="scss">` blocks.
- Global styles live in `src/assets/scss/app.scss` (imported in `main.js`).
- **Colors come from tokens, never literal light neutrals.** `:root` in `app.scss` defines the themed tokens: `--ml-bg`, `--ml-surface` (card and nav background), `--ml-ink` (text), `--ml-muted`, `--ml-text-2`, `--ml-subtle`, `--ml-line`, `--ml-control-bg` / `--ml-control-line` (segmented controls, inputs, pagination), `--ml-hover`, `--ml-chip`, `--ml-tint`, `--ml-avatar`, `--ml-skeleton` / `--ml-skeleton-hi`, `--ml-disabled`. Use them for every surface, border and text color that is not on a fixed dark overlay.
- Text on dark overlays (poster info bands, the photo viewer, the hero) uses `--ml-white` or literal white, because `--ml-surface` flips to dark in dark mode. `--ml-brand-dark` is a fixed brand color: use it only for text on the gold accent and for dark fills that stay dark in both themes.
- Gold accents, the hero and the poster artwork keep their colors in dark mode.
- Responsive rules: mobile styles go in `max-width` media queries only (`767.98px` for phones and small tablets, `575.98px` for small phones), so the desktop view stays exactly as it is. Font size on text fields under 768 px is 16px, so iOS does not zoom the page when a field is focused.
- Fonts: "Big Shoulders Display" (700/800) and "Manrope" (400–700) are loaded via `<link>` in `index.html`. Use "Big Shoulders Display" for display section titles (via `SectionHeading`) and "Manrope" for eyebrow labels; body/UI text stays on the system-ui stack.
- Brand theme uses the two colors in `src/assets/movieland-logo.svg`: dark `#171B25` and accent gold `#E99A16` (the logo may use its lighter gold gradient shade). Use these tokens across headings, section dividers, buttons, links, ratings, and interactions; avoid unrelated purple or blue accents.
- Keep list/slider toggles, upcoming headings, and recommendation headings within the brand palette; avoid gradient shadows behind section titles.
- Use compact icon-only segmented controls for cast view modes; keep hover feedback neutral and understated, with the dark brand color reserved for the selected mode.
- Icons are Bootstrap Icons (`bi bi-*`).
- Use the shared `PosterCard` component for all poster cards (variants `comingSoon`, `movie` (also TV), and `person`); do not add new per-card markup or styles.
- Poster cards use the theme tokens: `--ml-brand-dark` surface, `16px` radius, gold `--ml-brand-accent` accents, and a soft shadow (no border). Film/coming-soon cards show the poster clean on top with a blurred info band below; person cards keep a full-bleed photo with a bottom scrim and the name overlaid.
- The three `PosterCard` variants differ in media badges and info-band metadata: **comingSoon** (date chip + countdown + full release date), **movie** (rating badge, year · genre; a MOVIE/TV type badge shows only in mixed-type lists like search "Known for"), and **person** (name + "as {role}", VOICE badge, initials fallback).
- Detail route pages share `.detail-page`, `.detail-hero`, `.detail-poster`, `.detail-overview`, and `.detail-section` styles from `src/assets/scss/app.scss`; film and TV details use a two-column `.detail-hero` (poster + display title, genre/rating metadata, and Director/Writers fact cards).
- Bordered surfaces use `.page-card` (`app.scss`): it holds the padding (`--card-pad`), the surface background, the desktop corner radius, the dark mode line and the shadow. Don't write a card border per page.
- Phones (below 768 px): poster rows and client-paged grids swipe sideways instead of stacking into rows of two; keep that when adding a row. Headers put the poster beside the title block.
- Paging: every paged list uses `RoundPagination` (`src/components/RoundPagination.vue`). Don't add another page control.
- Page rhythm: the first panel of each page (the home hero, the film header card, the browse filters, About) uses `--ml-panel-radius` (20px). The space between blocks is `--page-gap` (`.page-block` on the home page, `.detail-section` on the detail and list pages), so every page has the same gaps. Don't add other margins between blocks.
- Keep the search panel (trigger, tabs, result rows, footer) and its styles in `SearchBar.vue`. The trigger is scoped with the `#search` id; the teleported panel uses the `.ml-spotlight` class, because it is no longer inside `#search`. Keep accents on the brand gold token.

## Dark mode
- The theme is a `data-theme` attribute on `<html>`: `light` (default) or `dark`. The choice is saved in localStorage under `movieland-theme` (`src/utils/theme.js`). `index.html` reads it in an inline script before first paint, so there is no flash.
- Dark values are set in the `:root[data-theme="dark"]` block of `app.scss`. The dark theme only changes those tokens. Keep the brand dark and the gold accent unchanged.
- New components use the tokens above, so they follow the theme without extra rules.

## Dates, images, IDs
- Dates: `formatDate(date, format)` from `@/utils/date`. Use `'YYYY'` for a standalone year, `'MMM D, YYYY'` for a short date (`Sep 7, 2006`), and `'ddd, MMM D, YYYY'` for the poster cards' long date.
- Languages: use `getLanguageName(code)` from `@/utils/language`; omit English from detail metadata and show other language names instead of ISO codes.
- Images: full URL `'https://image.tmdb.org/t/p/w500' + poster_path` (or `/original/` for backdrops).
- Card and detail artwork: use the shared `AsyncImage` component so the image frame reserves its dimensions before loading and shows a movie/person icon fallback until the image loads or when it fails.
- IDs: TMDB numeric ids; detail navigation uses `?id=`.

## API
- Every TMDB call goes through `src/api.js`; add new endpoints there as a named method.

## Linting
- ESLint flat config (`eslint.config.js`): `eslint-plugin-vue` `flat/recommended` (Vue 3) + `@eslint/js` recommended.
- Correctness rules stay on; formatting-only rules are disabled (no Prettier).
- `vue/multi-word-component-names` and `no-unused-vars` are off (legacy code).
- Commands: `npm run lint` (strict, `--max-warnings=0`) and `npm run lint:fix`.
