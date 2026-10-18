<template>
  <section v-if="popularMovies.length" class="hero-stage" aria-label="Popular movies" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
    <async-image
      :src="backdropUrl"
      :alt="activeMovie.title"
      :aspect-ratio="'auto'"
      frame-class="hero-backdrop"
      image-class="hero-backdrop-img"
    />
    <div class="hero-scrim" aria-hidden="true"></div>

    <div class="hero-content">
      <transition name="hero-fade" mode="out-in">
        <div :key="activeIndex" class="hero-main">
          <async-image
            :src="posterUrl"
            :alt="`${activeMovie.title} poster`"
            frame-class="hero-poster"
            image-class="hero-poster-img"
          />
          <div class="hero-copy">
            <span class="hero-eyebrow">
              <span class="hero-eyebrow-bar" aria-hidden="true"></span>Popular right now
            </span>
            <h1 class="hero-title">{{ activeMovie.title }}</h1>
            <div class="hero-meta">
              <span class="hero-meta-rating">
                <i class="bi bi-star-fill" aria-hidden="true"></i>{{ rating }}<span class="hero-meta-scale">/ 10</span>
              </span>
              <span v-if="year" class="hero-meta-dot" aria-hidden="true"></span>
              <span v-if="year">{{ year }}</span>
              <span v-if="genre" class="hero-meta-dot" aria-hidden="true"></span>
              <span v-if="genre">{{ genre }}</span>
            </div>
            <p class="hero-overview">{{ activeMovie.overview }}</p>
            <div class="hero-actions">
              <router-link class="hero-btn hero-btn-primary" :to="{ path: '/movie', query: { id: activeMovie.id } }">
                <i class="bi bi-play-fill" aria-hidden="true"></i>View details
              </router-link>
              <bookmark-button variant="pill" type="movie" :id="activeMovie.id" class="hero-btn hero-btn-ghost"></bookmark-button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="hero-upnext">
      <div class="hero-nav">
        <button type="button" class="hero-nav-btn" :disabled="atStart" aria-label="Previous film" @click="prev">
          <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <button type="button" class="hero-nav-btn" :disabled="atEnd" aria-label="Next film" @click="next">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <span class="hero-upnext-label">Up next</span>
      <div class="hero-progress">
        <span class="hero-progress-current">{{ current }}</span>
        <progress-track label="Slide" :value="activeIndex + 1" :page-count="total" @change="goToPage" />
        <span class="hero-progress-total">{{ totalLabel }}</span>
      </div>
      <div class="hero-upnext-grid">
        <button v-for="item in upNext" :key="item.index" type="button" class="hero-thumb" @click="goTo(item.index)">
          <async-image
            :src="item.backdrop ? 'https://image.tmdb.org/t/p/w500' + item.backdrop : ''"
            :alt="item.title"
            :aspect-ratio="'16 / 9'"
            frame-class="hero-thumb-media"
          />
          <span class="hero-thumb-text">
            <span class="hero-thumb-num">{{ item.num }}</span>
            <span class="hero-thumb-title">{{ item.title }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
  <section v-else class="hero-stage hero-skeleton" aria-hidden="true"></section>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api'
import AsyncImage from '@/components/AsyncImage.vue'
import ProgressTrack from '@/components/ProgressTrack.vue'
import BookmarkButton from '@/components/BookmarkButton.vue'
import { formatDate } from '@/utils/date'

const popularMovies = ref([])
const genres = ref([])
const activeIndex = ref(0)

const total = computed(() => popularMovies.value.length)
const activeMovie = computed(() => popularMovies.value[activeIndex.value] || null)

const pad = (n) => String(n).padStart(2, '0')

const current = computed(() => pad(activeIndex.value + 1))
const totalLabel = computed(() => pad(total.value))
const atStart = computed(() => activeIndex.value === 0)
const atEnd = computed(() => total.value <= 1 || activeIndex.value >= total.value - 1)

const rating = computed(() => (activeMovie.value?.vote_average ?? 0).toFixed(1))
const year = computed(() => formatDate(activeMovie.value?.release_date, 'YYYY'))
const genre = computed(() => {
  if (!activeMovie.value?.genre_ids?.length) return ''
  const map = new Map(genres.value.map((g) => [g.id, g.name]))
  return activeMovie.value.genre_ids.map((id) => map.get(id)).filter(Boolean).slice(0, 1).join('')
})

const backdropUrl = computed(() => {
  const path = activeMovie.value?.backdrop_path
  return path ? 'https://image.tmdb.org/t/p/original' + path : ''
})
const posterUrl = computed(() => {
  const path = activeMovie.value?.poster_path
  return path ? 'https://image.tmdb.org/t/p/w500' + path : ''
})

const upNext = computed(() => {
  const n = total.value
  if (n <= 1) return []
  const count = Math.min(3, n - 1)
  return Array.from({ length: count }, (_, o) => (activeIndex.value + o + 1) % n).map((j) => {
    const movie = popularMovies.value[j]
    return { index: j, num: pad(j + 1), title: movie.title, backdrop: movie.backdrop_path }
  })
})

const AUTOPLAY_DELAY = 5000
let autoplayTimer = null

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    if (total.value <= 1) return
    activeIndex.value = (activeIndex.value + 1) % total.value
  }, AUTOPLAY_DELAY)
}

function goTo(index) {
  activeIndex.value = index
  startAutoplay()
}

// The progress track counts pages from 1; the slides count from 0.
function goToPage(page) {
  goTo(page - 1)
}
function prev() {
  if (!atStart.value) {
    activeIndex.value -= 1
    startAutoplay()
  }
}
function next() {
  if (!atEnd.value) {
    activeIndex.value += 1
    startAutoplay()
  }
}

onMounted(async () => {
  const [moviesResponse, genresResponse] = await Promise.all([
    api.getPopularMovies(),
    api.getMovieGenres()
  ])
  popularMovies.value = moviesResponse.data.results
    .filter((movie) => movie.backdrop_path !== null)
    .slice(0, 20)
  genres.value = genresResponse.data.genres || []
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<style lang="scss">
.hero-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: clamp(560px, 66vw, 660px);
  overflow: hidden;
  border: 1px solid #222228;
  border-radius: 20px;
  background: #141418;
  color: #f4f2ee;
  font-family: Manrope, "Helvetica Neue", sans-serif;
  box-shadow: 0 18px 44px rgba(17, 25, 39, .18);
}

.hero-backdrop.media-image-frame {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: #141418;
}

.hero-backdrop-img { object-position: center; }

.hero-scrim {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(20, 20, 24, .98) 0%, rgba(20, 20, 24, .92) 40%, rgba(20, 20, 24, .55) 62%, rgba(20, 20, 24, 0) 82%),
    linear-gradient(0deg, rgba(14, 14, 16, .55) 0%, rgba(14, 14, 16, 0) 45%);
}

.hero-content {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  padding: clamp(24px, 4vw, 48px);
  box-sizing: border-box;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 56px);
  min-width: 0;
  width: 100%;
  max-width: 1040px;
}

.hero-poster.media-image-frame {
  flex: none;
  width: clamp(150px, 18vw, 230px);
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  box-shadow: 0 20px 44px rgba(0, 0, 0, .5);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--ml-brand-accent);
  white-space: nowrap;
}

.hero-eyebrow-bar {
  flex: none;
  width: 24px;
  height: 2px;
  background: var(--ml-brand-accent);
}

.hero-title {
  margin: 0;
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: clamp(44px, 6.5vw, 88px);
  line-height: .9;
  letter-spacing: .005em;
  text-transform: uppercase;
  text-wrap: balance;
  color: #f4f2ee;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  font-size: 15px;
  color: #c9c9d1;
}

.hero-meta-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #f4f2ee;
}

.hero-meta-rating i { color: var(--ml-brand-accent); }

.hero-meta-scale { font-weight: 500; color: #8c8c96; }

.hero-meta-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #4a4a52;
}

.hero-overview {
  margin: 0;
  max-width: 440px;
  font-size: 16px;
  line-height: 1.6;
  color: #a3a3ad;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 4px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: filter .15s ease, background-color .15s ease;
}

.hero-btn-primary {
  border: 0;
  background: var(--ml-brand-accent);
  color: #141210;
}
.hero-btn-primary:hover { color: #141210; filter: brightness(1.08); }

.hero-btn-ghost {
  padding: 0 22px;
  border: 1px solid #3a3a42;
  background: transparent;
  color: #f4f2ee;
}
.hero-btn-ghost:hover { background: rgba(255, 255, 255, .08); color: #f4f2ee; }
/* Bookmarked on the hero: the ghost button in the accent colour. The hero is always dark, so the text stays light. */
.hero-stage .hero-btn-ghost.is-active {
  border-color: var(--ml-brand-accent);
  background: rgba(233, 154, 22, .16);
  color: #f4f2ee;
}

.hero-btn:focus-visible,
.hero-nav-btn:focus-visible,
.hero-thumb:focus-visible {
  outline: 2px solid var(--ml-brand-accent);
  outline-offset: 3px;
}

.hero-nav {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-nav-btn {
  flex: none;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2a2a30;
  border-radius: 999px;
  background: #17171b;
  color: #f4f2ee;
  cursor: pointer;
  transition: background-color .15s ease;
}
.hero-nav-btn:hover:not(:disabled) { background: #26262c; }
.hero-nav-btn:disabled { opacity: .35; cursor: default; }

.hero-progress {
  flex: 1 1 220px;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-progress-current {
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  color: #f4f2ee;
}

/* The track is the shared ProgressTrack. The hero is always dark, so its line and knob ring keep the hero's colours. */
.hero-progress { --progress-line: #2a2a30; --progress-ring: #141418; }
.hero-progress .progress-track { flex: 1 1 auto; width: auto; min-width: 0; }

.hero-progress-total {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #8c8c96;
}

.hero-upnext {
  position: relative;
  z-index: 2;
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding: 14px clamp(20px, 4vw, 48px);
  border-top: 1px solid rgba(255, 255, 255, .08);
  background: linear-gradient(0deg, rgba(14, 14, 16, .92), rgba(14, 14, 16, .5));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.hero-upnext-label {
  flex: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: #8c8c96;
}

.hero-upnext-grid {
  flex: 1 1 560px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  min-width: 0;
}

.hero-thumb {
  height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  text-align: left;
  border: 1px solid #2a2a30;
  border-radius: 12px;
  background: #141418;
  color: #f4f2ee;
  font-family: inherit;
  cursor: pointer;
  transition: border-color .15s ease;
}
.hero-thumb:hover { border-color: #4a4a52; }

.hero-thumb-media.media-image-frame {
  flex: none;
  width: 96px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}

.hero-thumb-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hero-thumb-num {
  font-size: 12px;
  font-weight: 700;
  color: #8c8c96;
}

.hero-thumb-title {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-fade-enter-active,
.hero-fade-leave-active { transition: opacity .3s ease; }
.hero-fade-enter-from,
.hero-fade-leave-to { opacity: 0; }

.hero-skeleton { animation: hero-pulse 1.2s ease-in-out infinite; }
@keyframes hero-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .72; }
}

@media (max-width: 767.98px) {
  /* The height follows the content, so the copy is never clipped on narrow phones. */
  .hero-stage { height: auto; min-height: 560px; }
  /* The copy spans the full width here, so the scrim darkens from the bottom and keeps the text readable. */
  .hero-scrim {
    background:
      linear-gradient(0deg, rgba(20, 20, 24, .97) 0%, rgba(20, 20, 24, .88) 50%, rgba(20, 20, 24, .6) 100%);
  }
  .hero-content { padding: 20px; overflow: visible; }
  .hero-main { gap: 16px; }
  .hero-poster.media-image-frame { width: clamp(90px, 24vw, 140px); }
  .hero-eyebrow { font-size: 11px; letter-spacing: .14em; white-space: normal; }
  .hero-title { font-size: clamp(32px, 9vw, 48px); }
  .hero-overview { font-size: 14px; line-height: 1.5; }
  .hero-btn { height: 44px; padding: 0 18px; font-size: 14px; }
  .hero-btn-ghost { padding: 0 16px; }
  .hero-upnext { gap: 12px 14px; padding: 12px 16px; }
  .hero-nav-btn { width: 42px; height: 42px; }
  .hero-progress { flex: 1 1 100%; min-width: 0; }
  .hero-upnext-grid { flex: 1 1 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  /* Up-next tiles stack: the still on top, the title under it, so neither is cut off. */
  .hero-thumb { height: auto; flex-direction: column; align-items: stretch; gap: 6px; padding: 6px; }
  .hero-thumb-media.media-image-frame { width: 100%; }
  .hero-thumb-text { gap: 1px; }
  .hero-thumb-num { font-size: 10px; }
  .hero-thumb-title { font-size: 12px; line-height: 1.3; white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
}
</style>
