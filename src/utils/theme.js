// Dark mode preference, saved in localStorage. index.html applies the saved value before the app
// mounts, so the first paint already has the right theme.
export const THEME_STORAGE_KEY = 'movieland-theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    // Storage can be blocked (private window, disabled site data): stay on light.
    return 'light'
  }
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not saved, but the theme still applies for this visit.
  }
}
