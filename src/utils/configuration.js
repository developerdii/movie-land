import api from '@/api'

// Language and country lists for the browse filters. Loaded once per session;
// a failed load is retried on the next call.
let languagePromise = null
let countryPromise = null

function byName(a, b) {
  return a.name.localeCompare(b.name)
}

// Returns [{ code: 'fr', name: 'French' }, ...] sorted by name.
export function getLanguageList() {
  if (!languagePromise) {
    languagePromise = api.getLanguages()
      .then(({ data }) => {
        const byCode = new Map()
        data.forEach((lang) => {
          if (!byCode.has(lang.iso_639_1)) {
            byCode.set(lang.iso_639_1, { code: lang.iso_639_1, name: lang.english_name || lang.name || lang.iso_639_1 })
          }
        })
        return [...byCode.values()].sort(byName)
      })
      .catch((error) => {
        languagePromise = null
        throw error
      })
  }
  return languagePromise
}

// Returns [{ code: 'FR', name: 'France' }, ...] sorted by name.
export function getCountryList() {
  if (!countryPromise) {
    countryPromise = api.getCountries()
      .then(({ data }) => data
        .map((country) => ({ code: country.iso_3166_1, name: country.english_name || country.iso_3166_1 }))
        .sort(byName))
      .catch((error) => {
        countryPromise = null
        throw error
      })
  }
  return countryPromise
}
