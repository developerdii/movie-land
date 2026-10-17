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

// Minimum rating choices (TMDB vote_average.gte).
export const RATING_OPTIONS = [
  { value: '5', label: '5+' },
  { value: '6', label: '6+' },
  { value: '7', label: '7+' },
  { value: '8', label: '8+' }
]

// Maximum rating choices (TMDB vote_average.lte).
export const MAX_RATING_OPTIONS = [
  { value: '4', label: 'Up to 4' },
  { value: '5', label: 'Up to 5' },
  { value: '6', label: 'Up to 6' },
  { value: '7', label: 'Up to 7' },
  { value: '8', label: 'Up to 8' }
]

// Minimum number of votes (TMDB vote_count.gte), to leave out titles with only a few ratings.
export const MIN_VOTES_OPTIONS = [
  { value: '10', label: '10+' },
  { value: '50', label: '50+' },
  { value: '100', label: '100+' },
  { value: '500', label: '500+' },
  { value: '1000', label: '1,000+' },
  { value: '5000', label: '5,000+' },
  { value: '10000', label: '10,000+' }
]

// Maximum number of votes (TMDB vote_count.lte), to find lesser-known titles.
export const MAX_VOTES_OPTIONS = [
  { value: '10', label: 'Up to 10' },
  { value: '50', label: 'Up to 50' },
  { value: '100', label: 'Up to 100' },
  { value: '500', label: 'Up to 500' },
  { value: '1000', label: 'Up to 1,000' },
  { value: '5000', label: 'Up to 5,000' }
]

// Runtime buckets in minutes (TMDB with_runtime.gte / with_runtime.lte).
export const RUNTIME_OPTIONS = [
  { value: 'short', label: 'Under 90 min', params: { 'with_runtime.lte': 89 } },
  { value: 'medium', label: '90–120 min', params: { 'with_runtime.gte': 90, 'with_runtime.lte': 120 } },
  { value: 'long', label: 'Over 120 min', params: { 'with_runtime.gte': 121 } }
]

// TMDB list endpoints return 20 results per page and stop at page 500.
export const MAX_PAGES = 500

// Sorting or filtering by rating is noise unless the title has a minimum number of votes.
const MIN_VOTE_COUNT = 100

const SORT_PATTERN = /^(popularity|release_date|vote_average)\.(asc|desc)$/
const RATING_VALUES = RATING_OPTIONS.map((option) => option.value)
const MAX_RATING_VALUES = MAX_RATING_OPTIONS.map((option) => option.value)
const RUNTIME_VALUES = RUNTIME_OPTIONS.map((option) => option.value)
const MIN_VOTES_VALUES = MIN_VOTES_OPTIONS.map((option) => option.value)
const MAX_VOTES_VALUES = MAX_VOTES_OPTIONS.map((option) => option.value)

function first(value) {
  return Array.isArray(value) ? value[0] : value
}

export function parseBrowseQuery(query = {}) {
  const genre = first(query.genre) || ''
  const year = first(query.year) || ''
  const language = first(query.language) || ''
  const country = first(query.country) || ''
  const rating = first(query.rating) || ''
  const maxRating = first(query.maxRating) || ''
  const runtime = first(query.runtime) || ''
  const minVotes = first(query.minVotes) || ''
  const maxVotes = first(query.maxVotes) || ''
  const sort = first(query.sort) || ''
  const page = parseInt(first(query.page), 10)
  return {
    q: (first(query.q) || '').trim(),
    genre: /^\d+$/.test(genre) ? genre : '',
    year: /^\d{4}$/.test(year) ? year : '',
    language: /^[a-z]{2}$/.test(language) ? language : '',
    country: /^[A-Z]{2}$/.test(country) ? country : '',
    rating: RATING_VALUES.includes(rating) ? rating : '',
    maxRating: MAX_RATING_VALUES.includes(maxRating) ? maxRating : '',
    runtime: RUNTIME_VALUES.includes(runtime) ? runtime : '',
    minVotes: MIN_VOTES_VALUES.includes(minVotes) ? minVotes : '',
    maxVotes: MAX_VOTES_VALUES.includes(maxVotes) ? maxVotes : '',
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
  if (state.language) query.language = state.language
  if (state.country) query.country = state.country
  if (state.rating) query.rating = state.rating
  if (state.maxRating) query.maxRating = state.maxRating
  if (state.runtime) query.runtime = state.runtime
  if (state.minVotes) query.minVotes = state.minVotes
  if (state.maxVotes) query.maxVotes = state.maxVotes
  if (state.sort !== DEFAULT_SORT) query.sort = state.sort
  if (state.page > 1) query.page = String(state.page)
  return query
}

// True when a filter in the collapsible rows below the main bar is set (language, ratings, runtime, votes).
export function hasMoreFilters(state) {
  return Boolean(state.language || state.rating || state.maxRating || state.runtime || state.minVotes || state.maxVotes)
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
  if (state.language) params.with_original_language = state.language
  if (state.country) params.with_origin_country = state.country
  if (state.rating) params['vote_average.gte'] = state.rating
  if (state.maxRating) params['vote_average.lte'] = state.maxRating
  if (state.runtime) Object.assign(params, RUNTIME_OPTIONS.find((option) => option.value === state.runtime).params)
  // Rating sort and rating filters always need MIN_VOTE_COUNT votes; a chosen minimum can only raise it.
  const minVotes = Math.max(Number(state.minVotes) || 0, (field === 'vote_average' || state.rating || state.maxRating) ? MIN_VOTE_COUNT : 0)
  if (minVotes) params['vote_count.gte'] = minVotes
  if (state.maxVotes) params['vote_count.lte'] = state.maxVotes
  return params
}

export function yearOptions(from = 1950, to = new Date().getFullYear() + 1) {
  const years = []
  for (let year = to; year >= from; year--) years.push(year)
  return years
}
