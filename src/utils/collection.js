// Splits an array into chunks of `size`.
export function chunk(array, size) {
  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, i) => array.slice(i * size, i * size + size)
  )
}

// Returns a debounced version of `fn`.
export function debounce(fn, delay = 300) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
