// The US age rating shown on the score block. TMDB returns every country's ratings, so only the US one is used.

// A film's certification: the cinema rating (release type 3) when there is one, otherwise another US certification.
export function movieCertification(releaseDates) {
  const us = (releaseDates?.results || []).find((r) => r.iso_3166_1 === 'US')
  const entries = (us?.release_dates || []).filter((d) => d.certification)
  const cinema = entries.find((d) => d.type === 3) || entries[0]
  return cinema ? cinema.certification : ''
}

// A show's rating, such as TV-MA.
export function tvRating(contentRatings) {
  const us = (contentRatings?.results || []).find((r) => r.iso_3166_1 === 'US')
  return us?.rating || ''
}
