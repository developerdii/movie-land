const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Parses a date without timezone drift for the 'YYYY-MM-DD' format TMDB returns.
function parseDate(value) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return new Date(value)
}

// Formats a date the same way the legacy moment-based helper did.
// Supported formats: 'YYYY', 'MMM D, YYYY', and 'ddd, MMM D, YYYY'.
export function formatDate(date, format) {
  if (!date) return ''
  const d = parseDate(date)
  if (Number.isNaN(d.getTime())) return ''

  if (format === 'YYYY') return String(d.getFullYear())
  if (format === 'MMM D, YYYY') {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }
  if (format === 'ddd, MMM D, YYYY') {
    return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }
  return d.toDateString()
}

export function formatMonth(date) {
  const d = parseDate(date)
  return Number.isNaN(d.getTime()) ? '' : MONTHS[d.getMonth()]
}

export function formatDay(date) {
  const d = parseDate(date)
  return Number.isNaN(d.getTime()) ? '' : String(d.getDate())
}

export function daysUntil(date) {
  const d = parseDate(date)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((target - today) / 86400000)
}

