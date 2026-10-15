const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function getLanguageName(code) {
  if (!code || code.toLowerCase() === 'en') return ''

  try {
    return languageNames.of(code.toLowerCase()) || code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}
