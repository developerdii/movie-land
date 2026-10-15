// Splits an array into chunks of `size`.
export function chunk(array, size) {
  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, i) => array.slice(i * size, i * size + size)
  )
}

// Trims a list down to whole chunks of `size` (e.g. 20 → 18 for size 6),
// so no partial trailing slide is rendered. Keeps the list as-is when it
// fills fewer than one chunk.
export function trimToChunks(array, size = 6) {
  const whole = Math.floor(array.length / size) * size
  return whole > 0 ? array.slice(0, whole) : array
}

// Returns a debounced version of `fn`.
export function debounce(fn, delay = 300) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
