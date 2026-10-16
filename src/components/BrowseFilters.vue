<template>
  <section class="browse-filters" aria-label="Filters">
    <!-- Four equal columns, then a narrow column for the collapse button. Row 2 uses the same columns. -->
    <div class="browse-bar">
      <div class="browse-field">
        <label class="browse-label" for="browse-genre">Genre</label>
        <select id="browse-genre" v-model="genreModel" class="browse-select" :disabled="locked">
          <option value="">All genres</option>
          <option v-for="genre in genres" :key="genre.id" :value="String(genre.id)">{{ genre.name }}</option>
        </select>
      </div>

      <div class="browse-field">
        <label class="browse-label" for="browse-year">Year</label>
        <select id="browse-year" v-model="yearModel" class="browse-select" :disabled="locked">
          <option value="">Any year</option>
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>
      </div>

      <div class="browse-field">
        <label class="browse-label" for="browse-country">Country</label>
        <select id="browse-country" v-model="countryModel" class="browse-select" :disabled="locked">
          <option value="">Any country</option>
          <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
        </select>
      </div>

      <div class="browse-field">
        <label class="browse-label" for="browse-sort">Sort by</label>
        <div class="browse-sort">
          <select id="browse-sort" v-model="sortModel" class="browse-select" :disabled="locked">
            <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <button
            type="button"
            class="browse-sort-dir"
            :disabled="locked"
            :aria-label="'Sort direction: ' + directionLabel + '. Click to reverse.'"
            title="Reverse order"
            @click="emit('change', { sort: toggleSortDirection(state.sort) })"
          >
            <i :class="isAscending ? 'bi bi-arrow-up' : 'bi bi-arrow-down'" aria-hidden="true"></i>
            <span>{{ directionLabel }}</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="browse-more-toggle"
        :class="{ 'is-open': showMore }"
        aria-controls="browse-more"
        :aria-expanded="showMore"
        :aria-label="showMore ? 'Hide more filters' : 'Show more filters'"
        :title="showMore ? 'Hide more filters' : 'Show more filters'"
        :disabled="loading"
        @click="showMore = !showMore"
      >
        <i :class="showMore ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" aria-hidden="true"></i>
        <span v-if="moreActive && !showMore" class="browse-more-dot" aria-hidden="true"></span>
      </button>

      <!-- Wrapper only groups row 2; its children are grid items of .browse-bar. -->
      <div v-if="showMore" id="browse-more" class="browse-more">
        <div class="browse-field">
          <label class="browse-label" for="browse-language">Language</label>
          <select id="browse-language" v-model="languageModel" class="browse-select" :disabled="locked">
            <option value="">Any language</option>
            <option v-for="language in languages" :key="language.code" :value="language.code">{{ language.name }}</option>
          </select>
        </div>

        <div class="browse-field">
          <label class="browse-label" for="browse-rating">Min rating</label>
          <select id="browse-rating" v-model="ratingModel" class="browse-select" :disabled="locked">
            <option value="">Any rating</option>
            <option v-for="option in RATING_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="browse-field">
          <label class="browse-label" for="browse-max-rating">Max rating</label>
          <select id="browse-max-rating" v-model="maxRatingModel" class="browse-select" :disabled="locked">
            <option value="">Any rating</option>
            <option v-for="option in MAX_RATING_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="browse-field">
          <label class="browse-label" for="browse-runtime">Runtime</label>
          <select id="browse-runtime" v-model="runtimeModel" class="browse-select" :disabled="locked">
            <option value="">Any length</option>
            <option v-for="option in RUNTIME_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="chips.length" class="browse-chip-row">
      <ul class="browse-chips" aria-label="Active filters">
        <li
          v-for="chip in chips"
          :key="chip.key"
          class="browse-chip"
          :class="{ 'is-inactive': isSearching }"
        >
          <span class="browse-chip-text">{{ chip.label }}</span>
          <button type="button" class="browse-chip-x" :aria-label="'Remove ' + chip.label" :disabled="loading" @click="emit('change', chip.reset)">
            <i class="bi bi-x" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
      <button type="button" class="browse-clear" :disabled="loading" @click="emit('change', RESET)">
        <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>Clear all
      </button>
    </div>

    <p v-if="isSearching" class="browse-hint">Filters are ignored while searching. Clear the search to use them.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  DEFAULT_SORT,
  MAX_RATING_OPTIONS,
  RATING_OPTIONS,
  RUNTIME_OPTIONS,
  SORT_OPTIONS,
  hasMoreFilters,
  sortDirection,
  sortField,
  toggleSortDirection
} from '@/utils/browse'

const props = defineProps({
  state: { type: Object, required: true },
  genres: { type: Array, default: () => [] },
  years: { type: Array, default: () => [] },
  languages: { type: Array, default: () => [] },
  countries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['change'])

// Clear all resets the filters only; the search text has its own clear button.
const RESET = { genre: '', year: '', sort: DEFAULT_SORT, language: '', country: '', rating: '', maxRating: '', runtime: '' }

// TMDB search takes none of the discover filters, so they are off while a search text is set.
const isSearching = computed(() => Boolean(props.state.q))

// Filter controls are locked while a request runs, so a second change cannot race the first one.
const locked = computed(() => isSearching.value || props.loading)

const isAscending = computed(() => sortDirection(props.state.sort) === 'asc')
const directionLabel = computed(() => (isAscending.value ? 'Asc' : 'Desc'))

// Writable computeds let v-model keep the selects in sync with the URL-driven state.
function fieldModel(key) {
  return computed({
    get: () => props.state[key],
    set: (value) => emit('change', { [key]: value })
  })
}

const genreModel = fieldModel('genre')
const yearModel = fieldModel('year')
const countryModel = fieldModel('country')
const languageModel = fieldModel('language')
const ratingModel = fieldModel('rating')
const maxRatingModel = fieldModel('maxRating')
const runtimeModel = fieldModel('runtime')

const sortModel = computed({
  get: () => sortField(props.state.sort),
  set: (field) => emit('change', { sort: `${field}.desc` })
})

// Row 2 starts open when one of its filters is already set, e.g. from a link.
const showMore = ref(hasMoreFilters(props.state))
const moreActive = computed(() => hasMoreFilters(props.state))

// One chip per active filter.
const chips = computed(() => {
  const s = props.state
  const list = []
  if (s.genre) {
    const name = props.genres.find((genre) => String(genre.id) === s.genre)?.name || s.genre
    list.push({ key: 'genre', label: `Genre: ${name}`, reset: { genre: '' } })
  }
  if (s.year) list.push({ key: 'year', label: `Year: ${s.year}`, reset: { year: '' } })
  if (s.country) {
    const name = props.countries.find((country) => country.code === s.country)?.name || s.country
    list.push({ key: 'country', label: `Country: ${name}`, reset: { country: '' } })
  }
  if (s.language) {
    const name = props.languages.find((language) => language.code === s.language)?.name || s.language
    list.push({ key: 'language', label: `Language: ${name}`, reset: { language: '' } })
  }
  if (s.rating) list.push({ key: 'rating', label: `Min rating: ${s.rating}+`, reset: { rating: '' } })
  if (s.maxRating) list.push({ key: 'maxRating', label: `Max rating: ${s.maxRating}`, reset: { maxRating: '' } })
  if (s.runtime) {
    const label = RUNTIME_OPTIONS.find((option) => option.value === s.runtime).label
    list.push({ key: 'runtime', label: `Runtime: ${label}`, reset: { runtime: '' } })
  }
  if (s.sort !== DEFAULT_SORT) {
    const label = SORT_OPTIONS.find((option) => option.value === sortField(s.sort)).label
    list.push({ key: 'sort', label: `Sort: ${label} (${directionLabel.value.toLowerCase()})`, reset: { sort: DEFAULT_SORT } })
  }
  return list
})
</script>

<style lang="scss">
.browse-filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--ml-line);
  border-radius: 14px;
  background: var(--ml-surface);
}

/* Four equal columns (col-3 of the row) and a 44px collapse column. Row 2 uses the same columns, with no divider. */
.browse-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) 44px;
  gap: 14px;
  align-items: end;
}

/* Wrapper only groups row 2; its children are grid items of .browse-bar. */
.browse-more { display: contents; }

.browse-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; margin: 0; }

.browse-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ml-muted);
}

.browse-select {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9dde3;
  border-radius: 12px;
  background-color: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 15px;
  font-weight: 600;
  transition: border-color .15s ease;
}
.browse-select:hover:not(:disabled) { border-color: var(--ml-brand-accent); }
.browse-select:focus { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
.browse-select:disabled { background-color: #f6f7fa; color: rgba(var(--ml-muted-rgb), .6); cursor: not-allowed; }

/* Sort select and direction toggle sit side by side. Each piece draws its own outer border with the
   same 12px radius as the other fields, so the outer corners match exactly; no clipping wrapper. */
.browse-sort {
  display: flex;
  align-items: stretch;
  height: 44px;
}
.browse-sort .browse-select {
  flex: 1 1 auto;
  height: 100%;
  border: 1px solid #d9dde3;
  border-right: 0;
  border-radius: 12px 0 0 12px;
  background-color: var(--ml-surface);
}
.browse-sort .browse-select:focus { outline: none; }
.browse-sort .browse-select:disabled { background-color: #f6f7fa; }
.browse-sort:focus-within .browse-select,
.browse-sort .browse-select:hover:not(:disabled) { border-color: var(--ml-brand-accent); }

/* Fixed width, so switching between Asc and Desc does not resize the control. */
.browse-sort-dir {
  flex: none;
  width: 96px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid #d9dde3;
  border-radius: 0 12px 12px 0;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease, border-color .15s ease;
}
.browse-sort:focus-within .browse-sort-dir,
.browse-sort-dir:hover:not(:disabled) { border-color: var(--ml-brand-accent); }
.browse-sort-dir:hover:not(:disabled) { background: rgba(var(--ml-brand-accent-rgb), .14); color: var(--ml-brand-dark); }
.browse-sort-dir:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
.browse-sort-dir:disabled { color: rgba(var(--ml-muted-rgb), .6); cursor: not-allowed; }

.browse-more-toggle {
  position: relative;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid #d9dde3;
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.browse-more-toggle:hover { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
.browse-more-toggle.is-open { border-color: var(--ml-brand-accent); background: rgba(var(--ml-brand-accent-rgb), .12); color: var(--ml-brand-dark); }
.browse-more-toggle:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
.browse-more-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--ml-brand-accent);
}

.browse-chip-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.browse-chips {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
  list-style: none;
}

.browse-chip {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 230px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 4px 0 12px;
  border-radius: 999px;
  background: rgba(var(--ml-brand-accent-rgb), .12);
  color: var(--ml-brand-dark);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.browse-chip.is-inactive { opacity: .5; }

.browse-chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

.browse-chip-x {
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.browse-chip-x:hover { background: rgba(var(--ml-brand-dark-rgb), .08); }
.browse-chip-x:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.browse-clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--ml-muted);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: color .15s ease;
}
.browse-clear:hover { color: var(--ml-brand-accent); }
.browse-clear:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 3px; border-radius: 6px; }

.browse-hint { margin: 0; font-size: 13px; color: var(--ml-muted); }

.browse-filters button:disabled { opacity: .5; cursor: not-allowed; }

@media (max-width: 767.98px) {
  .browse-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .browse-more-toggle { grid-column: 1 / -1; justify-self: end; }
}
</style>
