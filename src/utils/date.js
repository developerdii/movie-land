const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function ordinal(day) {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

// Parses a date without timezone drift for the 'YYYY-MM-DD' format TMDB returns.
function parseDate(value) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return new Date(value)
}

// Formats a date the same way the legacy moment-based helper did.
// Supported formats: 'YYYY', 'MMM Do', and 'MMM Do YY'.
export function formatDate(date, format) {
  if (!date) return ''
  const d = parseDate(date)
  if (Number.isNaN(d.getTime())) return ''

  if (format === 'YYYY') return String(d.getFullYear())
  if (format === 'MMM Do' || format === 'MMM Do YY') {
    const month = MONTHS[d.getMonth()]
    const day = ordinal(d.getDate())
    if (format === 'MMM Do') return `${month} ${day}`
    const year = String(d.getFullYear()).slice(-2)
    return `${month} ${day} ${year}`
  }
  return d.toDateString()
}

