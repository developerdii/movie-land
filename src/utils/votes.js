// Vote counts are shown compact ("12.3K votes") next to the rating; the exact number goes in a tooltip.
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const exact = new Intl.NumberFormat('en-US')

export function formatVoteCount(count) {
  return `${compact.format(count)} ${count === 1 ? 'vote' : 'votes'}`
}

export function exactVoteCount(count) {
  return `${exact.format(count)} ${count === 1 ? 'vote' : 'votes'}`
}
