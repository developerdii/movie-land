// Browse page helpers. The URL query is the single source of truth:
// parseBrowseQuery reads it into a filter state, toBrowseQuery writes it back,
// and buildDiscoverParams maps the state onto TMDB's discover parameters.

export const BROWSE_TYPES = ['movie', 'tv', 'person']

export const DEFAULT_SORT = 'popularity.desc'

// UI sort keys and the TMDB sort field each media type uses for them.
const SORT_FIELDS = {
  popularity: { movie: 'popularity', tv: 'popularity' },
  release_date: { movie: 'primary_release_date', tv: 'first_air_date' },
  vote_average: { movie: 'vote_average', tv: 'vote_average' }
}

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'release_date', label: 'Release date' },
  { value: 'vote_average', label: 'Rating' }
]

// TMDB list endpoints return 20 results per page and stop at page 500.
export const MAX_PAGES = 500

// Sorting by rating is noise unless the title has a minimum number of votes.
const MIN_VOTE_COUNT = 100

const SORT_PATTERN = /^(popularity|release_date|vote_average)\.(asc|desc)$/

function first(value) {
  return Array.isArray(value) ? value[0] : value
}

export function parseBrowseQuery(query = {}) {
  const genre = first(query.genre) || ''
  const year = first(query.year) || ''
  const sort = first(query.sort) || ''
  const page = parseInt(first(query.page), 10)
  return {
    q: (first(query.q) || '').trim(),
    genre: /^\d+$/.test(genre) ? genre : '',
    year: /^\d{4}$/.test(year) ? year : '',
    sort: SORT_PATTERN.test(sort) ? sort : DEFAULT_SORT,
    page: page >= 1 && page <= MAX_PAGES ? page : 1
  }
}

// Only non-default values are written, so the default view is just /browse/{type}.
export function toBrowseQuery(state) {
  const query = {}
  if (state.q) query.q = state.q
  if (state.genre) query.genre = state.genre
  if (state.year) query.year = state.year
  if (state.sort !== DEFAULT_SORT) query.sort = state.sort
  if (state.page > 1) query.page = String(state.page)
  return query
}

export function sortField(sort) {
  return sort.split('.')[0]
}

export function sortDirection(sort) {
  return sort.split('.')[1]
}

export function toggleSortDirection(sort) {
  const next = sortDirection(sort) === 'desc' ? 'asc' : 'desc'
  return `${sortField(sort)}.${next}`
}

export function buildDiscoverParams(state, type) {
  const field = sortField(state.sort)
  const params = {
    page: state.page,
    sort_by: `${SORT_FIELDS[field][type]}.${sortDirection(state.sort)}`
  }
  if (state.genre) params.with_genres = state.genre
  if (state.year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = state.year
  if (field === 'vote_average') params['vote_count.gte'] = MIN_VOTE_COUNT
  return params
}

export function yearOptions(from = 1950, to = new Date().getFullYear() + 1) {
  const years = []
  for (let year = to; year >= from; year--) years.push(year)
  return years
}
