import axios from 'axios'
import api from '@/api'
import { chunk } from '@/utils/collection'

// The people born today, most popular first. TMDB has no search by birthday, so Wikidata gives the TMDB person ids of
// everyone born on today's date (its birth dates are indexed by exact value, which keeps the lookup quick). TMDB then
// gives the photo, the birthday and the popularity that order the list. The day's ids are saved on the device, so the
// lookup runs once a day and each visit fetches the cards again, like Recently Viewed.
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql'
const STORAGE_KEY = 'movieland-born-today'
const LIST_SIZE = 18
// The most linked-to people born today, before TMDB ranks them by popularity. Some have no photo or a different birthday there.
const CANDIDATES = 60
const FIRST_BIRTH_YEAR = 1800
const DETAIL_BATCH = 15

function dayKey(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// One exact date per year, from FIRST_BIRTH_YEAR to this year.
function birthdayQuery(date) {
  const monthDay = dayKey(date).slice(5)
  const values = []
  for (let year = FIRST_BIRTH_YEAR; year <= date.getFullYear(); year++) {
    values.push(`"${year}-${monthDay}T00:00:00Z"^^xsd:dateTime`)
  }
  return `SELECT ?tmdb ?sitelinks WHERE {
  VALUES ?born { ${values.join(' ')} }
  ?person wdt:P569 ?born ; wdt:P4985 ?tmdb ; wikibase:sitelinks ?sitelinks .
} ORDER BY DESC(?sitelinks) LIMIT ${CANDIDATES}`
}

async function candidateIds(date) {
  const { data } = await axios.post(WIKIDATA_ENDPOINT, new URLSearchParams({ query: birthdayQuery(date) }), {
    headers: { Accept: 'application/sparql-results+json' }
  })
  const ids = new Set(data.results.bindings.map((row) => Number(row.tmdb.value)))
  return [...ids]
}

// Only people with a photo and the same birthday on TMDB are kept, and the most popular LIST_SIZE of them.
async function popularBornToday(ids, monthDay) {
  const people = []
  for (const batch of chunk(ids, DETAIL_BATCH)) {
    const results = await Promise.allSettled(batch.map((id) => api.getPersonDetails(id)))
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const person = result.value.data
      if (person.profile_path && (person.birthday || '').slice(5) === monthDay) people.push(person)
    }
  }
  return people.sort((a, b) => b.popularity - a.popularity).slice(0, LIST_SIZE)
}

// Whole years from the birthday to the given date, both as YYYY-MM-DD. For someone who has died, that date is the death.
function ageOn(birthday, until) {
  let years = Number(until.slice(0, 4)) - Number(birthday.slice(0, 4))
  if (until.slice(5) < birthday.slice(5)) years -= 1
  return years
}

// The card fields the poster cards read: name, profile_path, known_for_department, and the age for the date chip.
function asCard(person, today) {
  return {
    id: person.id,
    name: person.name,
    profile_path: person.profile_path,
    known_for_department: person.known_for_department,
    age: ageOn(person.birthday, person.deathday || today),
    media_type: 'person'
  }
}

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved && typeof saved.date === 'string' && Array.isArray(saved.ids) ? saved : null
  } catch (error) {
    // Storage is blocked or the saved value is not valid JSON: the lookup runs again.
    return null
  }
}

function writeSaved(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    // Not saved: the lookup runs again on the next visit.
  }
}

// The card fields for today's list, most popular first. A failed lookup gives an empty list, so the section stays hidden.
export async function loadBornToday(date = new Date()) {
  const today = dayKey(date)
  const monthDay = today.slice(5)
  const saved = readSaved()
  try {
    if (saved?.date === today) {
      return (await popularBornToday(saved.ids, monthDay)).map((person) => asCard(person, today))
    }
    const people = await popularBornToday(await candidateIds(date), monthDay)
    writeSaved({ date: today, ids: people.map((person) => person.id) })
    return people.map((person) => asCard(person, today))
  } catch (error) {
    return []
  }
}
