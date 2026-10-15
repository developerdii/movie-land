# Coding Conventions

## Vue
- Vue 3 Composition API with `<script setup>`.
- Props via `defineProps`; shared logic in `src/utils/` (or `src/composables/` for reactive logic).
- Navigation via `useRouter().push({ path, query: { id } })`.

## Styling
- Bootstrap 5 utility classes + custom SCSS in `<style lang="scss">` blocks.
- Global styles live in `src/assets/scss/app.scss` (imported in `main.js`).
- Icons are Bootstrap Icons (`bi bi-*`).
- Reuse `.movie-card`, `.container-title` and existing carousel styles before adding new ones.

## Dates, images, IDs
- Dates: `getFormattedDate(date, format)` from `@/mixins/dateFormatter` (moment). Use `'YYYY'` for years, `'MMM Do YY'` for release dates.
- Images: full URL `'https://image.tmdb.org/t/p/w500' + poster_path` (or `/original/` for backdrops).
- IDs: TMDB numeric ids; detail navigation uses `?id=`.

## API
- Every TMDB call goes through `src/api.js`; add new endpoints there as a named method.

## Linting
- ESLint flat config (`eslint.config.js`): `eslint-plugin-vue` `flat/recommended` (Vue 3) + `@eslint/js` recommended.
- Correctness rules stay on; formatting-only rules are disabled (no Prettier).
- `vue/multi-word-component-names` and `no-unused-vars` are off (legacy code).
- Commands: `npm run lint` (strict, `--max-warnings=0`) and `npm run lint:fix`.
