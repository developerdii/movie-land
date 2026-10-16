<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="row g-4 detail-content person-detail-content">
      <div class="col-5 col-sm-4 col-lg-3">
        <async-image v-if="person.profile_path" kind="person" frame-class="detail-poster" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" :alt="person.name" />
        <div v-else class="detail-poster person-detail-initials" aria-hidden="true">{{ personInitials }}</div>
      </div>
      <div class="col-12 col-sm-8 col-lg-9">
        <div class="detail-hero-header">
          <div v-if="person.known_for_department" class="person-eyebrow">
            <span class="person-eyebrow-dash" aria-hidden="true"></span>
            <span class="section-heading-eyebrow">{{ person.known_for_department }}</span>
          </div>
          <h1 class="detail-title">{{ person.name }}</h1>
          <dl class="detail-facts">
            <div v-if="bornValue" class="detail-fact">
              <dt>{{ bornLabel }}</dt>
              <dd class="detail-fact-stack">
                <span>{{ bornValue }}</span>
                <span v-if="person.place_of_birth" class="detail-fact-sub">{{ person.place_of_birth }}</span>
              </dd>
            </div>
            <div v-if="person.known_for_department" class="detail-fact">
              <dt>Known for</dt>
              <dd>{{ person.known_for_department }}</dd>
            </div>
            <div v-if="creditCount" class="detail-fact">
              <dt>Credits</dt>
              <dd>{{ creditCount }}</dd>
            </div>
          </dl>
        </div>
        <div v-if="person.biography" class="person-biography-wrap">
          <p ref="bioElement" class="detail-overview person-biography" :class="{ 'is-collapsed': !bioExpanded }">{{ person.biography }}</p>
          <button v-if="bioNeedsToggle" type="button" class="read-more-link" :aria-expanded="bioExpanded" @click="bioExpanded = !bioExpanded">
            {{ bioExpanded ? 'Show less' : 'Read more' }}
          </button>
        </div>
      </div>
    </div>

    <media-section v-if="movieCredits.length" kind="movie" eyebrow="Filmography" title="Movies" :items="movieCredits" />

    <media-section v-if="tvCredits.length" kind="tv" eyebrow="Filmography" title="TV Shows" :items="tvCredits" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import AsyncImage from '../components/AsyncImage.vue'
import MediaSection from '../components/MediaSection.vue'

const route = useRoute()

const person = ref({})
const movieCredits = ref([])
const tvCredits = ref([])
const loading = ref(true)
const bioElement = ref(null)
const bioExpanded = ref(false)
const bioNeedsToggle = ref(false)
let bioResizeObserver

const personInitials = computed(() => {
  return (person.value.name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
})

function ageOn(birth, death) {
  const [by, bm, bd] = birth.split('-').map(Number)
  const end = death ? death.split('-').map(Number) : null
  const now = new Date()
  const ey = end ? end[0] : now.getFullYear()
  const em = end ? end[1] : now.getMonth() + 1
  const ed = end ? end[2] : now.getDate()
  let age = ey - by
  if (em < bm || (em === bm && ed < bd)) age--
  return age
}

const bornLabel = computed(() => (person.value.deathday ? 'Died' : 'Born'))
const bornValue = computed(() => {
  if (!person.value.birthday) return ''
  if (person.value.deathday) {
    const age = ageOn(person.value.birthday, person.value.deathday)
    return `${formatDate(person.value.deathday, 'MMM D, YYYY')} · age ${age}`
  }
  const age = ageOn(person.value.birthday, null)
  return `${formatDate(person.value.birthday, 'MMM D, YYYY')} · age ${age}`
})
const creditCount = computed(() => movieCredits.value.length + tvCredits.value.length)

function sortByDate(items, kind) {
  const field = kind === 'tv' ? 'first_air_date' : 'release_date'
  return [...items].sort((a, b) => {
    const da = a[field] || ''
    const db = b[field] || ''
    if (!da && !db) return 0
    if (!da) return 1
    if (!db) return -1
    return db.localeCompare(da)
  })
}

async function updateBioOverflow() {
  await nextTick()
  const element = bioElement.value
  if (!element) {
    bioNeedsToggle.value = false
    return
  }
  if (!bioExpanded.value) bioNeedsToggle.value = element.scrollHeight > element.clientHeight + 1
}

async function load() {
  loading.value = true
  bioExpanded.value = false
  bioNeedsToggle.value = false
  const id = route.query.id
  try {
    const [d, m, t] = await Promise.all([
      api.getPersonDetails(id),
      api.getPersonMovieCredits(id),
      api.getPersonTvCredits(id)
    ])
    person.value = d.data
    movieCredits.value = sortByDate(m.data.cast || [], 'movie')
    tvCredits.value = sortByDate(t.data.cast || [], 'tv')
    await updateBioOverflow()
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.id, load)
onMounted(() => {
  load()
  if (typeof ResizeObserver !== 'undefined') {
    bioResizeObserver = new ResizeObserver(() => updateBioOverflow())
    if (bioElement.value) bioResizeObserver.observe(bioElement.value)
  } else {
    window.addEventListener('resize', updateBioOverflow)
  }
})
watch(bioElement, (element, previousElement) => {
  if (previousElement) bioResizeObserver?.unobserve(previousElement)
  if (element) bioResizeObserver?.observe(element)
  updateBioOverflow()
})
onBeforeUnmount(() => {
  bioResizeObserver?.disconnect()
  window.removeEventListener('resize', updateBioOverflow)
})
</script>
