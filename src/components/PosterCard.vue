<template>
  <a
    class="poster-card"
    :class="`poster-card--${variant}`"
    :style="posterStyle"
    :href="href"
    :aria-label="ariaLabel"
    @click.prevent="onClick"
  >
    <div class="poster-card__media">
      <async-image
        v-if="imageUrl"
        :src="imageUrl"
        :alt="title"
        :kind="variant === 'person' ? 'person' : 'movie'"
        aspect-ratio="auto"
        frame-class="poster-card__frame"
      />
      <div v-else class="poster-card__initials" aria-hidden="true">{{ initials }}</div>

      <template v-if="variant === 'comingSoon'">
        <span v-if="releaseDate" class="poster-card__date-chip" aria-hidden="true">
          <span class="poster-card__chip-month">{{ month }}</span>
          <span class="poster-card__chip-day">{{ day }}</span>
        </span>
        <span v-if="countdown" class="poster-card__countdown">{{ countdown }}</span>
      </template>

      <template v-else-if="variant === 'movie'">
        <span v-if="rating" class="poster-card__rating" aria-hidden="true">
          <i class="bi bi-star-fill"></i>{{ rating.toFixed(1) }}
        </span>
        <span v-if="showType" class="poster-card__type">{{ typeLabel }}</span>
      </template>

      <span v-else-if="isVoice" class="poster-card__voice" aria-hidden="true">
        <i class="bi bi-mic-fill"></i>VOICE
      </span>
    </div>

    <div v-if="variant !== 'person'" class="card-info">
      <span class="poster-card__title">{{ title }}</span>
      <span class="poster-card__sub">{{ subtitle }}</span>
    </div>

    <div v-else class="poster-card__person">
      <span class="poster-card__title">{{ title }}</span>
      <span class="poster-card__role">
        <template v-if="roleName"><span class="poster-card__as">as </span>{{ roleName }}</template>
        <template v-else>{{ item.known_for_department }}</template>
      </span>
    </div>
  </a>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AsyncImage from '@/components/AsyncImage.vue'
import { daysUntil, formatDate, formatDay, formatMonth } from '@/utils/date'
import { getGenreMap } from '@/utils/genres'

const props = defineProps({
  variant: { type: String, required: true },
  item: { type: Object, required: true },
  mediaType: { type: String, default: 'movie' },
  showType: { type: Boolean, default: false }
})

const emit = defineEmits(['navigate'])

const isTv = computed(() => props.mediaType === 'tv')

const title = computed(() => {
  if (props.variant === 'person') return props.item.name || ''
  return isTv.value ? (props.item.name || '') : (props.item.title || '')
})

const imagePath = computed(() =>
  props.variant === 'person' ? props.item.profile_path : props.item.poster_path
)
const imageUrl = computed(() =>
  imagePath.value ? 'https://image.tmdb.org/t/p/w500' + imagePath.value : ''
)

const releaseDate = computed(() =>
  isTv.value ? props.item.first_air_date : props.item.release_date
)

const year = computed(() => formatDate(releaseDate.value, 'YYYY'))
const month = computed(() => formatMonth(releaseDate.value))
const day = computed(() => formatDay(releaseDate.value))
const countdown = computed(() => {
  const n = daysUntil(releaseDate.value)
  if (n === null) return ''
  if (n <= 0) return 'Out today'
  if (n === 1) return 'Tomorrow'
  return `In ${n} days`
})

const rating = computed(() => (props.item.vote_average > 0 ? props.item.vote_average : null))
const typeLabel = computed(() => (isTv.value ? 'TV' : 'MOVIE'))

const roleRaw = computed(() => props.item.character || '')
const isVoice = computed(() => /\(voice\)/i.test(roleRaw.value))
const roleName = computed(() => roleRaw.value.replace(/\s*\(voice\)\s*/i, '').trim())

const initials = computed(() =>
  (title.value || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
)

const posterStyle = computed(() => {
  if (props.variant === 'person' || !imageUrl.value) return {}
  return { '--poster': `url('${imageUrl.value}')` }
})

const genreName = ref('')
async function resolveGenre() {
  genreName.value = ''
  if (props.variant !== 'movie') return
  const ids = props.item.genre_ids
  if (!ids || !ids.length) return
  try {
    const map = await getGenreMap(props.mediaType)
    genreName.value = ids.map((id) => map.get(id)).find(Boolean) || ''
  } catch (e) {
    genreName.value = ''
  }
}
watch(() => [props.item, props.mediaType], resolveGenre, { immediate: true })

const subtitle = computed(() => {
  if (props.variant === 'comingSoon') {
    return formatDate(releaseDate.value, 'ddd, MMM D, YYYY')
  }
  if (year.value && genreName.value) return `${year.value} · ${genreName.value}`
  return year.value
})

const href = computed(() => {
  const type = props.variant === 'person' ? 'person' : props.mediaType
  return `#/${type}?id=${props.item.id}`
})

const ariaLabel = computed(() => {
  if (props.variant === 'comingSoon') {
    return `${title.value}, ${formatDate(releaseDate.value, 'ddd, MMM D, YYYY')}`
  }
  if (props.variant === 'person') {
    return `${title.value}${roleName.value ? ', as ' + roleName.value : ''}`
  }
  return `${title.value}, ${year.value}`
})

function onClick() {
  emit('navigate', props.item)
}
</script>

<style lang="scss">
.poster-card {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
  border-radius: 16px;
  outline: 1px solid rgba(128, 128, 128, .18);
  outline-offset: -1px;
  background: var(--ml-brand-dark);
  color: var(--ml-surface);
  box-shadow: 0 2px 4px rgba(var(--ml-brand-dark-rgb), .04), 0 10px 24px rgba(var(--ml-brand-dark-rgb), .08);
  text-decoration: none;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.poster-card:hover,
.poster-card:focus-visible {
  transform: translateY(-6px);
  outline-color: transparent;
  box-shadow: 0 0 0 2px var(--ml-brand-accent), 0 14px 30px rgba(var(--ml-brand-dark-rgb), .24);
}
.poster-card__media {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  flex: 0 0 auto;
}
.poster-card:not(.poster-card--person) .poster-card__media {
  aspect-ratio: 2 / 3;
}
.poster-card--person .poster-card__media {
  aspect-ratio: 3 / 4;
}

.poster-card__frame {
  width: 100%;
  height: 100%;
}

.poster-card__initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: rgba(var(--ml-muted-rgb), .4);
  background: linear-gradient(145deg, rgba(var(--ml-brand-dark-rgb), .6), var(--ml-brand-dark));
}

.poster-card__frame .media-image {
  transition: opacity .22s ease, transform .35s ease;
}
.poster-card:hover .poster-card__frame .media-image,
.poster-card:focus-visible .poster-card__frame .media-image {
  transform: scale(1.04);
}

.poster-card__date-chip {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  min-width: 40px;
  padding: 6px 9px 7px;
  border-radius: 6px;
  background: var(--ml-brand-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.poster-card__chip-month {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ml-brand-accent);
}
.poster-card__chip-day {
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: 24px;
  line-height: 1;
  color: var(--ml-surface);
}

.poster-card__countdown {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 3;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--ml-brand-accent);
  color: var(--ml-brand-dark);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
}

.poster-card__rating {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  height: 26px;
  padding: 0 9px;
  border-radius: 6px;
  background: var(--ml-brand-dark);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 800;
  color: var(--ml-surface);
}
.poster-card__rating i { color: var(--ml-brand-accent); font-size: 12px; }

.poster-card__type {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  height: 20px;
  padding: 0 7px;
  border-radius: 6px;
  background: rgba(var(--ml-brand-dark-rgb), .85);
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  color: var(--ml-surface);
}

.poster-card__voice {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  height: 22px;
  padding: 0 7px;
  border-radius: 6px;
  background: rgba(var(--ml-brand-dark-rgb), .85);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  color: var(--ml-surface);
}
.poster-card__voice i { color: var(--ml-brand-accent); }
.card-info {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 16px;
  min-height: 96px;
}
.poster-card--comingSoon .card-info::before,
.poster-card--movie .card-info::before {
  content: "";
  position: absolute;
  inset: -40px;
  background: var(--poster) center bottom / cover;
  filter: blur(28px) saturate(1.4);
  z-index: -2;
}
.poster-card--comingSoon .card-info::after,
.poster-card--movie .card-info::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(var(--ml-brand-dark-rgb), .72);
  z-index: -1;
}

.poster-card__title {
  margin: 0;
  font-family: Manrope, "Helvetica Neue", sans-serif;
  font-weight: 800;
  font-size: 16px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--ml-surface);
  text-shadow: 0 1px 2px rgba(0, 0, 0, .35);
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.poster-card__sub {
  font-family: Manrope, "Helvetica Neue", sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.25;
  color: rgba(var(--ml-surface-rgb), .65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-card--person .poster-card__media::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to top, rgba(var(--ml-brand-dark-rgb), .9) 0%, rgba(var(--ml-brand-dark-rgb), .6) 25%, transparent 50%);
  pointer-events: none;
}
.poster-card__person {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px 16px;
}
.poster-card__person .poster-card__title {
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.poster-card__role {
  font-family: Manrope, "Helvetica Neue", sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.25;
  color: rgba(var(--ml-surface-rgb), .85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poster-card__as {
  color: rgba(var(--ml-surface-rgb), .6);
}
</style>
