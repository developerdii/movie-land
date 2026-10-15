# Coding Conventions

## Vue
- Vue 3 Composition API with `<script setup>`.
- Props via `defineProps`; shared logic in `src/utils/` (or `src/composables/` for reactive logic).
- Navigation via `useRouter().push({ path, query: { id } })`.

## Styling
- Bootstrap 5 utility classes + custom SCSS in `<style lang="scss">` blocks.
- Global styles live in `src/assets/scss/app.scss` (imported in `main.js`).
- Brand theme uses the two colors in `src/assets/movieland-logo.svg`: dark `#171B25` and accent gold `#E99A16` (the logo may use its lighter gold gradient shade). Use these tokens across headings, section dividers, buttons, links, ratings, and interactions; avoid unrelated purple or blue accents.
- Keep list/slider toggles, upcoming headings, and recommendation headings within the brand palette; avoid gradient shadows behind section titles.
- Use compact icon-only segmented controls for cast view modes; keep hover feedback neutral and understated, with the dark brand color reserved for the selected mode.
- Icons are Bootstrap Icons (`bi bi-*`).
- Reuse `.movie-card`, `.container-title` and existing carousel styles before adding new ones.
- Detail route pages share `.detail-page`, `.detail-heading`, `.detail-content`, `.detail-poster`, `.detail-overview`, and `.detail-section` styles from `src/assets/scss/app.scss`; keep film and TV metadata in the heading row and avoid nested fact cards.
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
