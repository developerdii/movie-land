<template>
  <nav id="nav" class="navbar py-2">
    <div class="container-xxl ml-nav-inner">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img class="ml-brand-logo ml-brand-logo--light" src="../assets/movieland-logo.svg" alt="Movieland">
        <img class="ml-brand-logo ml-brand-logo--dark" src="../assets/movieland-logo-dark.svg" alt="" aria-hidden="true">
      </router-link>
      <div class="ml-nav-actions">
        <router-link
          class="ml-browse-link"
          :class="{ 'is-active': onBrowse }"
          :aria-current="onBrowse ? 'page' : undefined"
          aria-label="Browse movies, TV shows and people"
          title="Browse"
          to="/browse/movie"
        >
          <i class="bi bi-grid-3x3-gap" aria-hidden="true"></i>
          <span class="ml-browse-link-label">Browse</span>
        </router-link>
        <router-link
          class="ml-icon-link"
          :class="{ 'is-active': onBookmarks }"
          :aria-current="onBookmarks ? 'page' : undefined"
          aria-label="Bookmarks"
          title="Bookmarks"
          to="/bookmarks"
        >
          <i class="bi bi-bookmark" aria-hidden="true"></i>
        </router-link>
        <search-bar></search-bar>
        <theme-toggle></theme-toggle>
        <router-link
          class="ml-icon-link"
          :class="{ 'is-active': onAbout }"
          :aria-current="onAbout ? 'page' : undefined"
          aria-label="About Movie Land"
          title="About"
          to="/about"
        >
          <i class="bi bi-info-circle" aria-hidden="true"></i>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const onBrowse = computed(() => route.name === 'Browse')
const onAbout = computed(() => route.name === 'About')
const onBookmarks = computed(() => route.name === 'Bookmarks')
</script>

<style lang="scss">
#nav .ml-nav-inner {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* Bootstrap adds a right margin to the brand; the gap above already spaces it, and the margin would push
   the actions onto a second row on phones. */
#nav .navbar-brand { margin-right: 0; }

#nav .ml-brand-logo {
  display: block;
  width: auto;
  height: 40px;
}
#nav .ml-brand-logo--dark { display: none; }
:root[data-theme="dark"] #nav .ml-brand-logo--light { display: none; }
:root[data-theme="dark"] #nav .ml-brand-logo--dark { display: block; }

#nav .ml-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

/* Browse all: opens the filterable list pages. Same height and corners as the search and theme controls. */
#nav .ml-browse-link {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--ml-control-line);
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: border-color .15s ease, color .15s ease, background-color .15s ease;
}
#nav .ml-browse-link i { font-size: 1rem; }
#nav .ml-browse-link:hover { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
#nav .ml-browse-link.is-active {
  border-color: var(--ml-brand-accent);
  background: rgba(var(--ml-brand-accent-rgb), .12);
  color: var(--ml-ink);
}
#nav .ml-browse-link:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

/* The info (About) and bookmark icons: square, like the theme button beside them. */
#nav .ml-icon-link {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--ml-control-line);
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 1.05rem;
  text-decoration: none;
  transition: border-color .15s ease, color .15s ease, background-color .15s ease;
}
#nav .ml-icon-link:hover { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
#nav .ml-icon-link.is-active {
  border-color: var(--ml-brand-accent);
  background: rgba(var(--ml-brand-accent-rgb), .12);
}
#nav .ml-icon-link:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }

/* Phones and small tablets: icon only, so the logo, Browse, search and theme all fit on one row. */
@media (max-width: 767.98px) {
  #nav .ml-browse-link { width: 40px; padding: 0; justify-content: center; }
  #nav .ml-browse-link-label { display: none; }
}

/* Phones: the logo is cut down to its play tile (the same tile in both themes), so five controls fit on one
   row beside it. The brand box shows only the left part of the wordmark image. */
@media (max-width: 575.98px) {
  #nav .navbar-brand { flex: none; width: 36px; overflow: hidden; }
  #nav .ml-brand-logo { height: 36px; }
  #nav .ml-nav-actions { gap: 6px; }
  #nav .ml-browse-link,
  #nav .ml-icon-link,
  #nav .ml-theme-toggle,
  #nav #search .ml-search-trigger { width: 36px; height: 36px; }
}

@media (max-width: 374.98px) {
  #nav .ml-nav-inner { gap: 8px; }
  #nav .ml-nav-actions { gap: 4px; }
  #nav .ml-browse-link,
  #nav .ml-icon-link,
  #nav .ml-theme-toggle,
  #nav #search .ml-search-trigger { width: 34px; height: 34px; }
}
</style>
