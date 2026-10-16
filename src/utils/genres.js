import api from '@/api'

const cache = { movie: null, tv: null }

export async function getGenreMap(mediaType) {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  if (!cache[type]) {
    const response = type === 'tv' ? await api.getTvGenres() : await api.getMovieGenres()
    cache[type] = new Map((response.data.genres || []).map((g) => [g.id, g.name]))
  }
  return cache[type]
}
