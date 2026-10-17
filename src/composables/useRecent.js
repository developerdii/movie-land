import { reactive } from 'vue'

// The films, TV shows and people opened most recently: TMDB ids only, newest first, at most RECENT_LIMIT (three
// slides of six on the home page). Like the bookmarks, titles and posters are fetched from TMDB when they are
// shown, so only the ids are saved on the device.
export const RECENT_LIMIT = 18

const STORAGE_KEY = 'movieland-recent'
const RECENT_TYPES = ['movie', 'tv', 'person']

function isPair(entry) {
  return Array.isArray(entry) && RECENT_TYPES.includes(entry[0]) && Number.isInteger(entry[1])
}

function readStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) {
      return saved.filter(isPair).slice(0, RECENT_LIMIT).map(([type, id]) => ({ type, id }))
    }
  } catch (error) {
    // Storage is blocked or the saved value is not valid JSON: start with an empty list.
  }
  return []
}

const items = reactive(readStorage())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((item) => [item.type, item.id])))
  } catch (error) {
    // Not saved: the list still works until the page is closed.
  }
}

// Called once a detail page has loaded. Opening a title again moves it to the front; the oldest one beyond the
// limit is dropped.
export function recordVisit(type, id) {
  const index = items.findIndex((item) => item.type === type && item.id === id)
  if (index >= 0) items.splice(index, 1)
  items.unshift({ type, id })
  items.splice(RECENT_LIMIT)
  persist()
}

// The recent visits, newest first, as { type, id }. Call it inside a computed or the template to stay reactive.
export function recentVisits() {
  return items.map((item) => ({ type: item.type, id: item.id }))
}

// Another tab changed the list: keep this one in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) items.splice(0, items.length, ...readStorage())
  })
}
