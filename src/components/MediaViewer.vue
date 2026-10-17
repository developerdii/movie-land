<template>
  <div
    ref="rootEl"
    class="media-viewer"
    role="dialog"
    aria-modal="true"
    :aria-label="label"
    tabindex="-1"
    @click.self="close"
  >
    <div v-if="background" class="media-viewer__bg" :style="backgroundStyle" aria-hidden="true"></div>

    <header class="media-viewer__bar">
      <div v-if="visibleGroups.length > 1" class="media-viewer__tabs" role="tablist" aria-label="Photo type">
        <button
          v-for="group in visibleGroups"
          :key="group.key"
          type="button"
          role="tab"
          class="media-viewer__tab"
          :class="{ 'is-active': group.key === activeKey }"
          :aria-selected="group.key === activeKey"
          @click="selectGroup(group.key)"
        >
          {{ group.label }}
          <span class="media-viewer__tab-count">{{ group.items.length }}</span>
        </button>
      </div>
      <span v-else class="media-viewer__title">{{ activeGroup.label }}</span>

      <span class="media-viewer__count" aria-live="polite">{{ total ? safeIndex + 1 : 0 }} / {{ total }}</span>

      <button type="button" class="media-viewer__close" aria-label="Close" @click="close">
        <i class="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </header>

    <div class="media-viewer__stage" @click.self="close">
      <button v-if="total > 1" type="button" class="media-viewer__nav" aria-label="Previous photo" @click="prev">
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>

      <figure v-if="current" :key="current.path + safeIndex" class="media-viewer__figure">
        <img class="media-viewer__img" :src="mainSrc(current)" :alt="current.caption || activeGroup.label">
        <figcaption v-if="current.caption" class="media-viewer__caption">{{ current.caption }}</figcaption>
      </figure>
      <p v-else class="media-viewer__empty">{{ activeGroup.loading ? 'Loading photos…' : 'No photos yet.' }}</p>

      <button v-if="total > 1" type="button" class="media-viewer__nav" aria-label="Next photo" @click="next">
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>

    <div v-if="total > 1" ref="thumbsEl" class="media-viewer__thumbs" aria-label="All photos">
      <button
        v-for="(item, i) in activeGroup.items"
        :key="item.path + i"
        type="button"
        class="media-viewer__thumb"
        :class="{ 'is-active': i === safeIndex }"
        :aria-label="'Photo ' + (i + 1)"
        :aria-current="i === safeIndex ? 'true' : undefined"
        @click="jumpTo(i)"
      >
        <img :src="thumbSrc(item)" alt="" loading="lazy">
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { imageUrl } from '@/utils/images'

// A photo viewer with one or more groups (e.g. Backdrops, Posters, Logos).
// Clicking the dark area around the photo, the close button or Escape closes it.
const props = defineProps({
  groups: { type: Array, required: true }, // [{ key, label, size, loading, items: [{ path, caption }] }]
  startGroup: { type: String, default: '' },
  startIndex: { type: Number, default: 0 },
  background: { type: String, default: '' },
  label: { type: String, default: 'Photos' }
})

const emit = defineEmits(['close'])

// Empty groups are hidden. If everything is empty, the first group stays so the viewer can show its empty state.
const visibleGroups = computed(() => {
  const filled = props.groups.filter((group) => group.items.length)
  return filled.length ? filled : props.groups.slice(0, 1)
})

function resolveKey(key) {
  return visibleGroups.value.some((group) => group.key === key) ? key : (visibleGroups.value[0]?.key || '')
}

const activeKey = ref(resolveKey(props.startGroup))
const index = ref(props.startIndex)

watch(visibleGroups, () => { activeKey.value = resolveKey(activeKey.value) })

const activeGroup = computed(() => visibleGroups.value.find((group) => group.key === activeKey.value) || { label: '', items: [], size: 'w780' })
const total = computed(() => activeGroup.value.items.length)
const safeIndex = computed(() => Math.min(index.value, Math.max(total.value - 1, 0)))
const current = computed(() => activeGroup.value.items[safeIndex.value] || null)

const backgroundStyle = computed(() => (props.background ? { backgroundImage: `url('${props.background}')` } : {}))
const mainSrc = (item) => imageUrl(item.path, activeGroup.value.size || 'w780')
const thumbSrc = (item) => imageUrl(item.path, 'w300')

function selectGroup(key) {
  activeKey.value = key
  index.value = 0
}

function step(delta) {
  if (total.value > 1) index.value = (safeIndex.value + delta + total.value) % total.value
}

function prev() { step(-1) }
function next() { step(1) }
function jumpTo(i) { index.value = i }
function close() { emit('close') }

const thumbsEl = ref(null)
watch(safeIndex, () => {
  nextTick(() => {
    thumbsEl.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })
})

function onKeydown(event) {
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') prev()
  else if (event.key === 'ArrowRight') next()
}

const rootEl = ref(null)
let previouslyFocused = null

onMounted(() => {
  previouslyFocused = document.activeElement
  document.body.classList.add('media-viewer-open')
  window.addEventListener('keydown', onKeydown)
  rootEl.value?.focus()
})

onBeforeUnmount(() => {
  document.body.classList.remove('media-viewer-open')
  window.removeEventListener('keydown', onKeydown)
  previouslyFocused?.focus?.()
})
</script>

<style lang="scss">
body.media-viewer-open { overflow: hidden; }

.media-viewer {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 16px 20px;
  overflow: hidden;
  background: rgba(12, 14, 20, .94);
  color: #fff;
  outline: none;
  animation: media-viewer-in .18s ease;
}

@keyframes media-viewer-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .media-viewer { animation: none; }
}

/* The page backdrop, blurred behind the photo. */
.media-viewer__bg {
  position: absolute;
  inset: -40px;
  z-index: 0;
  background: center / cover no-repeat;
  filter: blur(40px) saturate(1.2);
  opacity: .28;
  pointer-events: none;
}

.media-viewer__bar,
.media-viewer__stage,
.media-viewer__thumbs {
  position: relative;
  z-index: 1;
}

.media-viewer__bar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.media-viewer__tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .08);
}

.media-viewer__tab {
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, .75);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.media-viewer__tab:hover:not(.is-active) { color: #fff; }
.media-viewer__tab.is-active { background: var(--ml-brand-accent); color: var(--ml-brand-dark); }

.media-viewer__tab-count {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, .14);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.media-viewer__tab.is-active .media-viewer__tab-count { background: rgba(23, 27, 37, .16); }

.media-viewer__title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ml-brand-accent);
}

.media-viewer__count {
  margin-left: auto;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, .7);
}

.media-viewer__close,
.media-viewer__nav {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, .12);
  color: #fff;
  cursor: pointer;
  transition: background-color .15s ease;
}
.media-viewer__close { flex: none; width: 40px; height: 40px; font-size: 16px; }
.media-viewer__close:hover,
.media-viewer__nav:hover { background: rgba(255, 255, 255, .22); }

.media-viewer__close:focus-visible,
.media-viewer__nav:focus-visible,
.media-viewer__tab:focus-visible,
.media-viewer__thumb:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

.media-viewer__stage {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.media-viewer__nav { flex: none; width: 48px; height: 48px; font-size: 18px; }

.media-viewer__figure {
  margin: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.media-viewer__img {
  display: block;
  width: auto;
  height: auto;
  max-width: min(100%, 1280px);
  max-height: calc(100vh - 240px);
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .45);
}

.media-viewer__caption {
  max-width: 60ch;
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, .75);
}

.media-viewer__empty { margin: 0; color: rgba(255, 255, 255, .7); }

.media-viewer__thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 2px;
  scrollbar-width: thin;
}

.media-viewer__thumb {
  flex: none;
  height: 56px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  opacity: .55;
  cursor: pointer;
  transition: opacity .15s ease, border-color .15s ease;
}
.media-viewer__thumb:hover { opacity: .9; }
.media-viewer__thumb.is-active { opacity: 1; border-color: var(--ml-brand-accent); }
.media-viewer__thumb img {
  display: block;
  height: 100%;
  width: auto;
  max-width: 110px;
  object-fit: cover;
}

@media (max-width: 575.98px) {
  .media-viewer__count { font-size: 13px; }
  .media-viewer__nav { width: 40px; height: 40px; }
  .media-viewer__img { max-height: calc(100vh - 260px); }
}
</style>
