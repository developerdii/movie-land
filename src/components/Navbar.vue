<template>
  <nav id="nav" class="navbar">
    <div class="container-xxl ml-nav-inner">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img class="ml-brand-logo ml-brand-logo--light" src="../assets/movieland-logo.svg" alt="Movieland">
        <img class="ml-brand-logo ml-brand-logo--dark" src="../assets/movieland-logo-dark.svg" alt="" aria-hidden="true">
      </router-link>
      <div class="ml-nav-links">
        <router-link
          class="ml-nav-link"
          :class="{ 'is-active': onHome }"
          :aria-current="onHome ? 'page' : undefined"
          to="/"
        >Home</router-link>
        <router-link
          class="ml-nav-link"
          :class="{ 'is-active': onBrowse }"
          :aria-current="onBrowse ? 'page' : undefined"
          to="/browse/movie"
        >Browse</router-link>
      </div>
      <div class="ml-nav-actions">
        <search-bar></search-bar>
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
const onHome = computed(() => route.name === 'Home')
const onBrowse = computed(() => route.name === 'Browse')
const onAbout = computed(() => route.name === 'About')
const onBookmarks = computed(() => route.name === 'Bookmarks')
</script>

<style lang="scss">
/* One row, 56 px tall: the logo and the Home and Browse links on the left, the search field and the icon buttons
   on the right. The bar has no vertical padding, so the active link's gold line sits on its bottom edge. */
#nav {
  padding-block: 0;
}

#nav .ml-nav-inner {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 28px;
  height: 56px;
}

/* Bootstrap adds a right margin to the brand; the gap above already spaces it, and the margin would push
   the actions onto a second row on phones. */
#nav .navbar-brand { margin-right: 0; }

/* The logo is one link. Its box is the image's own size (the viewBox is 520 x 112), so the whole wordmark, text
   included, is the clickable area, and browsers cannot shrink the image to a smaller target. */
#nav .navbar-brand {
  flex: none;
  border-radius: 8px;
  transition: opacity .15s ease;
}
#nav .navbar-brand:hover { opacity: .85; }
#nav .navbar-brand:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
#nav .ml-brand-logo {
  display: block;
  width: calc(40px * 520 / 112);
  height: 40px;
}
#nav .ml-brand-logo--dark { display: none; }
:root[data-theme="dark"] #nav .ml-brand-logo--light { display: none; }
:root[data-theme="dark"] #nav .ml-brand-logo--dark { display: block; }

/* Home and Browse: text links. The active one is white with a gold line along the bottom edge of the bar. */
#nav .ml-nav-links {
  display: flex;
  align-items: stretch;
  gap: 24px;
  height: 100%;
}
#nav .ml-nav-link {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--ml-muted);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: color .15s ease;
}
#nav .ml-nav-link:hover { color: var(--ml-ink); }
#nav .ml-nav-link.is-active { color: var(--ml-ink); }
#nav .ml-nav-link.is-active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--ml-brand-accent);
}
#nav .ml-nav-link:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; border-radius: 4px; }

#nav .ml-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

/* The bookmark and info icons: square, like the theme button beside them. */
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

/* Phones: the logo is cut down to its play tile (the same tile in both themes), so the links and the icon buttons
   fit on one row beside it. The brand box shows only the left part of the wordmark image. */
@media (max-width: 575.98px) {
  #nav .navbar-brand { flex: none; width: 36px; overflow: hidden; }
  #nav .ml-brand-logo { width: calc(36px * 520 / 112); height: 36px; }
  #nav .ml-nav-inner { gap: 16px; }
  #nav .ml-nav-links { gap: 14px; }
  #nav .ml-nav-link { font-size: 14px; }
  #nav .ml-nav-actions { gap: 6px; }
  #nav .ml-icon-link,
  #nav .ml-theme-toggle,
  #nav #search .ml-search-trigger { width: 36px; height: 36px; }
}

@media (max-width: 374.98px) {
  #nav .navbar-brand { width: 32px; }
  #nav .ml-brand-logo { width: calc(32px * 520 / 112); height: 32px; }
  #nav .ml-nav-inner { gap: 10px; }
  #nav .ml-nav-links { gap: 10px; }
  #nav .ml-nav-link { font-size: 13px; }
  #nav .ml-nav-actions { gap: 4px; }
  #nav .ml-icon-link,
  #nav .ml-theme-toggle,
  #nav #search .ml-search-trigger { width: 32px; height: 32px; }
}
</style>
