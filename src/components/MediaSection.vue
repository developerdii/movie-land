<template>
  <section class="detail-section cast-section" :aria-busy="loading">
    <section-heading :eyebrow="eyebrow" :title="title">
      <template #actions>
        <div class="cast-seg" role="group" :aria-label="title + ' display mode'">
          <button type="button" class="cast-seg-btn" :class="{ active: view === 'grid' }"
                  :aria-pressed="view === 'grid'" aria-label="Grid view" title="Grid view" @click="view = 'grid'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>
          </button>
          <button type="button" class="cast-seg-btn" :class="{ active: view === 'list' }"
                  :aria-pressed="view === 'list'" aria-label="List view" title="List view" @click="view = 'list'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path></svg>
          </button>
        </div>
        <round-pagination :page="pageIndex + 1" :page-count="pageCount" :disabled="loading" @update:page="goToPage($event - 1)" />
      </template>
    </section-heading>

    <span v-if="loading" class="visually-hidden" role="status">Loading results</span>

    <ul v-if="view === 'grid'" class="cast-grid" :class="{ 'cast-grid--row': !serverPaged }">
      <template v-if="showSkeleton">
        <li v-for="n in SERVER_PAGE_SIZE" :key="'skeleton-' + n" class="cast-grid-item" aria-hidden="true">
          <poster-card-skeleton />
        </li>
      </template>
      <template v-else>
        <li v-for="item in pagedItems" :key="item.id" class="cast-grid-item">
          <poster-card
            :variant="isPerson ? 'person' : 'movie'"
            :item="item"
            :media-type="kind"
            :roles="item.roles || []"
            :upcoming="!!item.upcoming"
            @navigate="open"
          />
        </li>
      </template>
    </ul>

    <ul v-else class="cast-list">
      <template v-if="showSkeleton">
        <li v-for="n in SERVER_PAGE_SIZE" :key="'skeleton-' + n" class="cast-row cast-row--skeleton" aria-hidden="true">
          <span class="cast-avatar cast-avatar--skeleton skeleton-shimmer"></span>
          <span class="cast-row-skeleton-bar cast-row-skeleton-bar--name skeleton-shimmer"></span>
          <span class="cast-row-skeleton-bar cast-row-skeleton-bar--role skeleton-shimmer"></span>
        </li>
      </template>
      <template v-else>
        <li v-for="item in pagedItems" :key="item.id" class="cast-row" @click="open(item)">
          <span class="cast-avatar" :class="{ 'cast-avatar--poster': !isPerson }" aria-hidden="true">
            <img v-if="imagePath(item)" :src="imageUrl(item, isPerson ? 'w185' : 'w92')" :alt="titleOf(item)" />
            <span v-else>{{ initials(titleOf(item)) }}</span>
          </span>
          <span class="cast-row-name">{{ titleOf(item) }}</span>
          <span v-if="item.upcoming" class="cast-row-pill cast-row-pill--upcoming">Upcoming</span>
          <span v-if="item.allRoles && item.allRoles.length" class="cast-row-roles">
            <span v-for="role in item.allRoles" :key="role" class="cast-row-pill">{{ role }}</span>
          </span>
          <span class="cast-row-role">{{ subtitleOf(item) }}</span>
        </li>
      </template>
    </ul>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PosterCard from './PosterCard.vue'
import PosterCardSkeleton from './PosterCardSkeleton.vue'
import SectionHeading from './SectionHeading.vue'
import RoundPagination from './RoundPagination.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  kind: { type: String, default: 'person' },
  eyebrow: { type: String, default: 'Starring' },
  title: { type: String, default: 'Cast' },
  // Server-paged mode (browse page): `items` is one TMDB page and paging is
  // driven by `page` (1-based) and `totalPages`, via the update:page event.
  serverPaged: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:page'])

// TMDB returns 20 results per page, so a server-paged load shows 20 placeholders.
const SERVER_PAGE_SIZE = 20
const showSkeleton = computed(() => props.loading && props.serverPaged)

const router = useRouter()
const view = ref('grid')

const isPerson = computed(() => props.kind === 'person')

// Client-side paging (cast and filmography) keeps its own index.
const localPage = ref(0)
const pageSize = computed(() => (view.value === 'grid' ? 6 : 12))
const pageIndex = computed(() => (props.serverPaged ? props.page - 1 : localPage.value))
const pageCount = computed(() => (
  props.serverPaged
    ? Math.max(1, props.totalPages)
    : Math.max(1, Math.ceil(props.items.length / pageSize.value))
))
const pagedItems = computed(() => (
  props.serverPaged
    ? props.items
    : props.items.slice(localPage.value * pageSize.value, (localPage.value + 1) * pageSize.value)
))
function goToPage(index) {
  if (props.serverPaged) emit('update:page', index + 1)
  else localPage.value = index
}

watch(view, () => { localPage.value = 0 })

function titleOf(item) {
  return props.kind === 'movie' ? item.title : item.name
}

function subtitleOf(item) {
  if (props.kind === 'person') return item.character || item.known_for_department || ''
  const date = props.kind === 'tv' ? item.first_air_date : item.release_date
  return date ? date.slice(0, 4) : ''
}

function imagePath(item) {
  return props.kind === 'person' ? item.profile_path : item.poster_path
}

function imageUrl(item, size = 'w500') {
  const path = imagePath(item)
  return path ? 'https://image.tmdb.org/t/p/' + size + path : ''
}

function open(item) {
  router.push({ path: '/' + props.kind, query: { id: item.id } })
}

function initials(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}
</script>


<style lang="scss">
.cast-seg { display: flex; gap: 4px; padding: 4px; background: var(--ml-control-bg); border: 1px solid var(--ml-control-line); border-radius: 999px; }
.cast-seg-btn {
  width: 44px; height: 40px;
  border: 0; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: var(--ml-subtle);
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.cast-seg-btn:hover:not(.active) { color: var(--ml-ink); }
.cast-seg-btn.active { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }
.cast-seg-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.cast-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 32px 20px;
}

.cast-grid-item { min-width: 0; }

/* List-view skeleton rows. The shimmer comes from .skeleton-shimmer. */
.cast-row--skeleton { cursor: default; }
.cast-row--skeleton:hover { background: none; }
.cast-row .cast-avatar.cast-avatar--skeleton { border: 0; background: none; }
.cast-row-skeleton-bar { display: block; height: 12px; border-radius: 6px; }
.cast-row-skeleton-bar--name { flex: 1 1 auto; max-width: 260px; height: 14px; }
.cast-row-skeleton-bar--role { flex: none; width: 90px; }

.cast-list {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  column-gap: 48px;
}

.cast-row {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--ml-line);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color .15s ease;
}
.cast-row:hover { background: var(--ml-tint); }

.cast-avatar {
  width: 48px; height: 48px; flex: none;
  border-radius: 999px;
  background: var(--ml-avatar);
  border: 1px solid var(--ml-line);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-weight: 700; font-size: 15px; color: var(--ml-subtle);
}
.cast-avatar--poster { width: 36px; height: 54px; border-radius: 4px; }
.cast-avatar img { width: 100%; height: 100%; object-fit: cover; }

.cast-row-name { flex: 1 1 auto; min-width: 0; font-size: 16px; font-weight: 700; color: var(--ml-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cast-row-role { font-size: 14px; color: var(--ml-muted); text-align: right; }

/* Every role a person had on a title, in the list view. All roles share the ACTING pill style. */
.cast-row-roles { display: flex; flex: none; gap: 6px; }
.cast-row-pill {
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  background: var(--ml-chip);
  color: var(--ml-text-2);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.cast-row-pill--upcoming { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }

@media (max-width: 639.98px) {
  .cast-list { grid-template-columns: 1fr; }
}

@media (max-width: 767.98px) {
  /* Two cards per row on phones, like the browse grid, instead of one card per screen. */
  .cast-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 12px; }
  /* Client-paged lists (cast, filmography) hold six at a time, so on phones they swipe sideways like the poster
     rows. Browse results are long and stay a two-column grid. */
  .cast-grid--row {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 2px 14px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .cast-grid--row::-webkit-scrollbar { display: none; }
  .cast-grid--row > li { flex: 0 0 42%; scroll-snap-align: start; }
  .cast-seg-btn { width: 40px; }
}
</style>

