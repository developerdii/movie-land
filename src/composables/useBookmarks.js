import { reactive } from 'vue'

// Bookmarks are TMDB ids only: one list of [type, id] pairs, newest first. Titles, posters and facts are
// fetched from TMDB when they are shown, so nothing about the titles themselves is stored on the device.
export const BOOKMARK_TYPES = ['movie', 'tv', 'person']

const STORAGE_KEY = 'movieland-bookmarks'

function isPair(entry) {
  return Array.isArray(entry) && BOOKMARK_TYPES.includes(entry[0]) && Number.isInteger(entry[1])
}

function readStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) {
      return saved.filter(isPair).map(([type, id]) => ({ type, id }))
    }
    // The first version stored ids per type. Keep them; their relative order across types is not known.
    if (saved && typeof saved === 'object') {
      return BOOKMARK_TYPES.flatMap((type) => (
        (Array.isArray(saved[type]) ? saved[type] : []).filter(Number.isInteger).map((id) => ({ type, id }))
      ))
    }
  } catch (error) {
    // Storage is blocked or the saved value is not valid JSON: start with no bookmarks.
  }
  return []
}

const items = reactive(readStorage())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map((item) => [item.type, item.id])))
  } catch (error) {
    // Not saved: the bookmark still works until the page is closed.
  }
}

function matches(item, type, id) {
  return item.type === type && item.id === id
}

export function useBookmarks() {
  return {
    // Ids of one type, newest first. Call it inside a computed or the template so it stays reactive.
    ids: (type) => items.filter((item) => item.type === type).map((item) => item.id),
    count: (type) => items.filter((item) => item.type === type).length,
    has: (type, id) => items.some((item) => matches(item, type, id)),
    // The newest bookmarked id of a type, or null.
    latest: (type) => items.find((item) => item.type === type)?.id ?? null,
    // The newest bookmarks of the given types (across types, in the order they were saved), as { type, id }.
    recent: (types, limit) => items.filter((item) => types.includes(item.type)).slice(0, limit).map((item) => ({ type: item.type, id: item.id })),
    toggle(type, id) {
      const index = items.findIndex((item) => matches(item, type, id))
      if (index >= 0) items.splice(index, 1)
      else items.unshift({ type, id })
      persist()
    }
  }
}

// The first type that has bookmarks, so /bookmarks opens where the user's saved titles are.
export function firstBookmarkedType() {
  return BOOKMARK_TYPES.find((type) => items.some((item) => item.type === type)) || 'movie'
}

// Another tab changed the bookmarks: keep this one in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) items.splice(0, items.length, ...readStorage())
  })
}
