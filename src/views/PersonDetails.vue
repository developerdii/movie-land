<template>
  <div v-if="!loading" class="container-xxl detail-page">
    <div class="row g-4 detail-content person-detail-content">
      <div class="col-5 col-sm-4 col-lg-3">
        <button v-if="person.profile_path" type="button" class="detail-poster-btn" aria-label="View photos" @click="openPhotos">
          <async-image kind="person" frame-class="detail-poster" :src="'https://image.tmdb.org/t/p/w500' + person.profile_path" :alt="person.name" />
        </button>
        <div v-else class="detail-poster person-detail-initials" aria-hidden="true">{{ personInitials }}</div>
      </div>
      <div class="col-12 col-sm-8 col-lg-9">
        <div class="detail-hero-header">
          <div v-if="person.known_for_department" class="person-eyebrow">
            <span class="person-eyebrow-dash" aria-hidden="true"></span>
            <span class="section-heading-eyebrow">{{ person.known_for_department }}</span>
          </div>
          <h1 class="detail-title">{{ person.name }}</h1>
          <bookmark-button v-if="person.id" type="person" :id="person.id"></bookmark-button>
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

    <media-strip v-if="taggedPreviewLoading || tagged.length" :items="tagged" :loading="taggedPreviewLoading" @open="openTagged" />

    <media-section v-if="movieCredits.length" kind="movie" eyebrow="Filmography" title="Movies" :items="movieCredits" />

    <media-section v-if="tvCredits.length" kind="tv" eyebrow="Filmography" title="TV Shows" :items="tvCredits" />

    <media-viewer
      v-if="viewer.open"
      :groups="viewerGroups"
      :start-group="viewer.group"
      :start-index="viewer.index"
      :label="(person.name || 'Person') + ' photos'"
      @close="viewer.open = false"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils/date'
import { sortImages, toViewerItems } from '@/utils/images'
import AsyncImage from '../components/AsyncImage.vue'
import BookmarkButton from '../components/BookmarkButton.vue'
import MediaSection from '../components/MediaSection.vue'
import MediaStrip from '../components/MediaStrip.vue'
import MediaViewer from '../components/MediaViewer.vue'

const route = useRoute()

const person = ref({})
const movieCredits = ref([])
const tvCredits = ref([])
const loading = ref(true)
const bioElement = ref(null)
const bioExpanded = ref(false)
const bioNeedsToggle = ref(false)
let bioResizeObserver

// Photos: profile pictures and photos tagged in films and episodes. Tagged photos are paged and load on first open.
const profiles = ref([])
const tagged = ref([])
const taggedLoading = ref(false)
const taggedLoaded = ref(false)
const taggedPreviewLoading = ref(false)
const viewer = reactive({ open: false, group: 'profiles', index: 0 })
// Stop walking the tagged pages after this many, so a very popular person does not trigger dozens of requests.
const MAX_TAGGED_PAGES = 5

// The header picture always appears: it opens on the same file in the profile list, or stands alone if there is none.
const photoItems = computed(() => {
  if (profiles.value.length) return profiles.value
  return person.value.profile_path ? [{ path: person.value.profile_path, caption: '' }] : []
})

const viewerGroups = computed(() => [
  { key: 'profiles', label: 'Profile', size: 'w780', items: photoItems.value },
  { key: 'tagged', label: 'Photos', size: 'w1280', loading: taggedLoading.value, items: tagged.value }
])

// Clicking a photo in the strip opens the Photos group at that photo.
function openTagged(index) {
  viewer.group = 'tagged'
  viewer.index = index
  viewer.open = true
  loadTagged()
}

function openPhotos() {
  // Start on the picture shown in the header, if it is in the profile list.
  const index = photoItems.value.findIndex((photo) => photo.path === person.value.profile_path)
  viewer.group = 'profiles'
  viewer.index = Math.max(index, 0)
  viewer.open = true
  loadTagged()
}

async function loadProfiles(id) {
  try {
    const { data } = await api.getPersonImages(id)
    profiles.value = toViewerItems(sortImages(data.profiles))
  } catch (e) {
    profiles.value = []
  }
}

const taggedCaption = (image) => image.media?.title || image.media?.name || ''

// The first page of tagged photos feeds the strip; the full set loads when the viewer opens.
async function loadTaggedPreview(id) {
  taggedPreviewLoading.value = true
  try {
    const { data } = await api.getPersonTaggedImages(id, 1)
    if (!taggedLoaded.value) tagged.value = toViewerItems(data.results || [], taggedCaption)
  } catch (e) {
    tagged.value = []
  } finally {
    taggedPreviewLoading.value = false
  }
}

async function loadTagged() {
  if (taggedLoaded.value || taggedLoading.value) return
  const id = route.query.id
  taggedLoading.value = true
  const collected = []
  try {
    for (let page = 1; page <= MAX_TAGGED_PAGES; page++) {
      const { data } = await api.getPersonTaggedImages(id, page)
      collected.push(...(data.results || []))
      if (page >= (data.total_pages || 1)) break
    }
    tagged.value = toViewerItems(collected, taggedCaption)
    taggedLoaded.value = true
  } catch (e) {
    console.log(e)
  } finally {
    taggedLoading.value = false
  }
}

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

// TMDB crew jobs that the filmography shows as badges. Other jobs (producer, editor, ...) are listed without one.
const CREW_ROLE = { Director: 'Directing', Writer: 'Writing', Screenplay: 'Writing', Story: 'Writing', Teleplay: 'Writing' }
// TMDB known_for_department values that map to one of the badge roles.
const DEPARTMENT_ROLE = { Acting: 'Acting', Directing: 'Directing', Writing: 'Writing' }
// One badge per card: the first of these that applies.
const BADGE_PRIORITY = ['Directing', 'Writing', 'Acting']

const ROLE_ORDER = ['Acting', 'Directing', 'Writing']

// The person's main role is what they are known for, so a film that has it shows no roles at all.
// On every other film, each role the person had there is visible, in ROLE_ORDER.
function visibleRoles(roles, mainRole) {
  if (mainRole && roles.includes(mainRole)) return []
  return ROLE_ORDER.filter((role) => roles.includes(role))
}

// Cast and crew work for the same title is merged into one entry, so a film is listed once.
// Each entry gets the roles visible on it (see visibleRoles) and at most one badge. knownFor is the main department.
function mergeCredits(cast = [], crew = [], kind, knownFor) {
  const mainRole = DEPARTMENT_ROLE[knownFor] || null
  const byId = new Map()
  const add = (item, role) => {
    if (!byId.has(item.id)) byId.set(item.id, { item, roles: new Set() })
    if (role) byId.get(item.id).roles.add(role)
  }
  cast.forEach((item) => add(item, 'Acting'))
  crew.forEach((item) => add(item, CREW_ROLE[item.job]))
  const merged = [...byId.values()].map(({ item, roles }) => {
    // `allRoles` is every visible role, for the list view; `roles` is the one grid badge.
    const allRoles = visibleRoles([...roles], mainRole)
    const badge = BADGE_PRIORITY.find((role) => allRoles.includes(role))
    return { ...item, roles: badge ? [badge] : [], allRoles }
  })
  return sortByDate(merged, kind)
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
  profiles.value = []
  tagged.value = []
  taggedLoaded.value = false
  viewer.open = false
  const id = route.query.id
  try {
    const [d, m, t] = await Promise.all([
      api.getPersonDetails(id),
      api.getPersonMovieCredits(id),
      api.getPersonTvCredits(id)
    ])
    person.value = d.data
    movieCredits.value = mergeCredits(m.data.cast, m.data.crew, 'movie', person.value.known_for_department)
    tvCredits.value = mergeCredits(t.data.cast, t.data.crew, 'tv', person.value.known_for_department)
    loadProfiles(id)
    loadTaggedPreview(id)
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
