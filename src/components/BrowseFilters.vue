<template>
  <section class="browse-filters" aria-label="Filters">
    <div class="browse-filters-top">
      <div class="browse-seg" role="group" aria-label="Media type">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="browse-seg-btn"
          :class="{ active: tab.value === type }"
          :aria-pressed="tab.value === type"
          @click="emit('change', { type: tab.value })"
        >{{ tab.label }}</button>
      </div>

      <button v-if="hasFilters" type="button" class="browse-clear" @click="emit('change', RESET)">
        <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>Clear all
      </button>
    </div>

    <div v-if="state.q" class="browse-search-chip">
      <span>Search: <strong>{{ state.q }}</strong></span>
      <button type="button" class="browse-chip-clear" aria-label="Clear search" @click="emit('change', { q: '' })">
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>

    <div v-if="type !== 'person'" class="browse-controls" :class="{ 'is-disabled': !!state.q }">
      <div class="browse-field">
        <label class="browse-label" for="browse-genre">Genre</label>
        <select id="browse-genre" v-model="genreModel" class="browse-select" :disabled="!!state.q">
          <option value="">All genres</option>
          <option v-for="genre in genres" :key="genre.id" :value="String(genre.id)">{{ genre.name }}</option>
        </select>
      </div>

      <div class="browse-field">
        <label class="browse-label" for="browse-year">Year</label>
        <select id="browse-year" v-model="yearModel" class="browse-select" :disabled="!!state.q">
          <option value="">Any year</option>
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>
      </div>

      <div class="browse-field">
        <label class="browse-label" for="browse-sort">Sort by</label>
        <div class="browse-sort">
          <select id="browse-sort" v-model="sortModel" class="browse-select" :disabled="!!state.q">
            <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <button
            type="button"
            class="browse-direction"
            :disabled="!!state.q"
            :aria-label="'Sort direction: ' + directionLabel + '. Click to reverse.'"
            :title="'Reverse order'"
            @click="emit('change', { sort: toggleSortDirection(state.sort) })"
          >
            <i :class="isAscending ? 'bi bi-sort-up' : 'bi bi-sort-down'" aria-hidden="true"></i>
            <span>{{ directionLabel }}</span>
          </button>
        </div>
      </div>
    </div>

    <p v-if="type !== 'person' && state.q" class="browse-hint">Genre, year and sort apply when the search is cleared.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  sortDirection,
  sortField,
  toggleSortDirection
} from '@/utils/browse'

const props = defineProps({
  type: { type: String, required: true },
  state: { type: Object, required: true },
  genres: { type: Array, default: () => [] },
  years: { type: Array, default: () => [] }
})

const emit = defineEmits(['change'])

const RESET = { genre: '', year: '', sort: DEFAULT_SORT, q: '' }

const tabs = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
  { value: 'person', label: 'People' }
]

const hasFilters = computed(() =>
  Boolean(props.state.q || props.state.genre || props.state.year || props.state.sort !== DEFAULT_SORT)
)

const isAscending = computed(() => sortDirection(props.state.sort) === 'asc')
const directionLabel = computed(() => (isAscending.value ? 'Asc' : 'Desc'))

// Writable computeds let v-model keep the selects in sync with the URL-driven state.
const genreModel = computed({
  get: () => props.state.genre,
  set: (genre) => emit('change', { genre })
})

const yearModel = computed({
  get: () => props.state.year,
  set: (year) => emit('change', { year })
})

const sortModel = computed({
  get: () => sortField(props.state.sort),
  set: (field) => emit('change', { sort: `${field}.desc` })
})
</script>

<style lang="scss">
.browse-filters {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 22px;
  border: 1px solid var(--ml-line);
  border-radius: 14px;
  background: var(--ml-surface);
}

.browse-filters-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.browse-seg { display: flex; gap: 4px; padding: 4px; background: #f4f5f7; border: 1px solid #d9dde3; border-radius: 999px; }
.browse-seg-btn {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #4a5568;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.browse-seg-btn:hover:not(.active) { color: var(--ml-brand-dark); }
.browse-seg-btn.active { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }
.browse-seg-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.browse-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--ml-muted);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: color .15s ease;
}
.browse-clear:hover { color: var(--ml-brand-accent); }
.browse-clear:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 3px; border-radius: 6px; }

.browse-search-chip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 6px 0 14px;
  border-radius: 999px;
  background: rgba(var(--ml-brand-accent-rgb), .12);
  color: var(--ml-brand-dark);
  font-size: 14px;
}
.browse-search-chip strong { font-weight: 800; }

.browse-chip-clear {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ml-brand-dark);
  cursor: pointer;
  transition: background-color .15s ease;
}
.browse-chip-clear:hover { background: rgba(var(--ml-brand-dark-rgb), .08); }
.browse-chip-clear:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.browse-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  align-items: end;
}

.browse-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

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

.browse-sort { display: flex; gap: 8px; }
.browse-sort .browse-select { flex: 1 1 auto; }

.browse-direction {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9dde3;
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color .15s ease, color .15s ease;
}
.browse-direction:hover:not(:disabled) { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
.browse-direction:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
.browse-direction:disabled { color: rgba(var(--ml-muted-rgb), .6); cursor: not-allowed; }

.browse-hint { margin: 0; font-size: 13px; color: var(--ml-muted); }
</style>
