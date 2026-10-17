// TMDB image helpers. Sizes: w185 / w300 / w500 / w780 / w1280 / original.
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

export function imageUrl(path, size = 'w500') {
  return path ? TMDB_IMAGE_BASE + size + path : ''
}

// Community score first, then how many votes it has.
export function sortImages(list = []) {
  return [...list].sort((a, b) => (
    (b.vote_average || 0) - (a.vote_average || 0) || (b.vote_count || 0) - (a.vote_count || 0)
  ))
}

// Keeps only what the viewer needs: the TMDB file path, the image's shape (so its loading skeleton
// has the same proportions) and an optional caption.
export function toViewerItems(list = [], caption = () => '') {
  return list.map((image) => ({
    path: image.file_path,
    ratio: image.width && image.height ? image.width / image.height : null,
    caption: caption(image)
  }))
}
