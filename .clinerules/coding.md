# Coding Conventions

## Vue
- Vue 3 Composition API with `<script setup>`.
- Props via `defineProps`; shared logic in `src/utils/` (or `src/composables/` for reactive logic).
- Navigation via `useRouter().push({ path, query: { id } })`.

## Styling
- Bootstrap 5 utility classes + custom SCSS in `<style lang="scss">` blocks.
- Global styles live in `src/assets/scss/app.scss` (imported in `main.js`).
- Fonts: "Big Shoulders Display" (700/800) and "Manrope" (400–700) are loaded via `<link>` in `index.html`. Use "Big Shoulders Display" for display section titles (via `SectionHeading`) and "Manrope" for eyebrow labels; body/UI text stays on the system-ui stack.
- Brand theme uses the two colors in `src/assets/movieland-logo.svg`: dark `#171B25` and accent gold `#E99A16` (the logo may use its lighter gold gradient shade). Use these tokens across headings, section dividers, buttons, links, ratings, and interactions; avoid unrelated purple or blue accents.
- Keep list/slider toggles, upcoming headings, and recommendation headings within the brand palette; avoid gradient shadows behind section titles.
- Use compact icon-only segmented controls for cast view modes; keep hover feedback neutral and understated, with the dark brand color reserved for the selected mode.
- Icons are Bootstrap Icons (`bi bi-*`).
- Use the shared `PosterCard` component for all poster cards (variants `comingSoon`, `movie` (also TV), and `person`); do not add new per-card markup or styles.
- Poster cards use the theme tokens: `--ml-brand-dark` surface, `20px` radius, gold `--ml-brand-accent` accents, and a soft shadow (no border). Film/coming-soon cards show the poster clean on top with a blurred info band below; person cards keep a full-bleed photo with a bottom scrim and the name overlaid.
- The three `PosterCard` variants differ in media badges and info-band metadata: **comingSoon** (date chip + countdown + full release date), **movie** (rating badge, optional MOVIE/TV type badge, year · genre), and **person** (name + "as {role}", VOICE badge, initials fallback).
- Detail route pages share `.detail-page`, `.detail-hero`, `.detail-poster`, `.detail-overview`, and `.detail-section` styles from `src/assets/scss/app.scss`; film and TV details use a two-column `.detail-hero` (poster + display title, genre/rating metadata, and Director/Writers fact cards).
- Keep the search dropdown (light surface, tabs, result rows, footer) and its styles in `SearchBar.vue`; scope its rules with the `#search` id and keep accents on the brand gold token.

## Dates, images, IDs
- Dates: `formatDate(date, format)` from `@/utils/date`. Use `'YYYY'` for a standalone year and `'MMM Do YY'` for a single compact release date.
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
