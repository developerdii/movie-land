<template>
  <form class="browse-search" role="search" @submit.prevent="submit">
    <label class="visually-hidden" for="browse-search">Search {{ noun }}</label>
    <input
      id="browse-search"
      type="text"
      class="browse-search-input"
      :value="draft"
      :placeholder="'Search ' + noun"
      autocomplete="off"
      enterkeyhint="search"
      @input="onInput"
    >
    <button v-if="draft" type="button" class="browse-search-btn" aria-label="Clear search" @click="clear">
      <i class="bi bi-x-lg" aria-hidden="true"></i>
    </button>
    <button type="submit" class="browse-search-btn browse-search-btn--go" aria-label="Search">
      <i class="bi bi-search" aria-hidden="true"></i>
    </button>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  q: { type: String, default: '' },
  type: { type: String, required: true }
})

const emit = defineEmits(['change'])

const NOUNS = { movie: 'movies', tv: 'TV shows', person: 'people' }
const noun = computed(() => NOUNS[props.type])

// The field keeps a local draft while typing and writes `q` to the URL after a short pause or on Enter.
// The URL stays the source of truth: a q change from elsewhere (e.g. "Browse all") replaces the draft.
const SEARCH_DELAY = 300
const draft = ref(props.q)
let lastSent = props.q
let timer = null

watch(() => props.q, (q) => {
  // Our own update comes back through the URL; skip it so keys typed meanwhile are kept.
  if (q !== lastSent) draft.value = q
})

function submit() {
  clearTimeout(timer)
  const q = draft.value.trim()
  if (q === props.q) return
  lastSent = q
  emit('change', { q })
}

function onInput(event) {
  draft.value = event.target.value
  clearTimeout(timer)
  timer = setTimeout(submit, SEARCH_DELAY)
}

function clear() {
  draft.value = ''
  submit()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style lang="scss">
.browse-search {
  display: flex;
  align-items: center;
  width: min(100%, 380px);
  height: 44px;
  margin-left: auto;
  padding: 0 4px 0 12px;
  border: 1px solid #d9dde3;
  border-radius: 12px;
  background: var(--ml-surface);
  transition: border-color .15s ease;
}
.browse-search:focus-within { border-color: var(--ml-brand-accent); }

.browse-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ml-ink);
  font-size: 15px;
  font-weight: 600;
  outline: none;
}
.browse-search-input::placeholder { color: var(--ml-muted); font-weight: 500; }

.browse-search-btn {
  flex: none;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ml-muted);
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.browse-search-btn:hover { background: #f1f3f6; color: var(--ml-ink); }
.browse-search-btn--go { margin-left: 2px; background: var(--ml-brand-accent); color: var(--ml-brand-dark); }
.browse-search-btn--go:hover { background: var(--ml-brand-accent); color: var(--ml-brand-dark); filter: brightness(1.05); }
.browse-search-btn:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
</style>
