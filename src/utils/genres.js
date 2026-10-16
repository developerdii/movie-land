import api from '@/api'

const cache = { movie: null, tv: null }

async function loadGenres(mediaType) {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  if (!cache[type]) {
    const response = type === 'tv' ? await api.getTvGenres() : await api.getMovieGenres()
    const list = response.data.genres || []
    cache[type] = { list, map: new Map(list.map((g) => [g.id, g.name])) }
  }
  return cache[type]
}

export async function getGenreMap(mediaType) {
  return (await loadGenres(mediaType)).map
}

export async function getGenreList(mediaType) {
  return (await loadGenres(mediaType)).list
}
