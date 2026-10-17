<template>
  <article class="about-page">
    <h1 class="about-title">About Movie Land</h1>

    <p>
      Movie Land is a place to browse movies, TV shows and people. Search or filter by genre, year, rating and votes,
      open any title for its details, cast, photos and recommendations, and see what is popular right now.
    </p>

    <!-- TMDB asks for its logo and this notice to be shown in the application. -->
    <div class="about-credit">
      <a class="about-credit-logo" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
        <img :src="TMDB_LOGO" alt="The Movie Database (TMDB)">
      </a>
      <p class="about-credit-notice">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
      <p>
        Titles, details, posters, backdrops and photos come from The Movie Database. The artwork and the titles belong to
        their rights holders. The
        <a href="https://www.themoviedb.org/api-terms-of-use" target="_blank" rel="noopener noreferrer">TMDB API terms of use</a>
        apply to the data shown here.
      </p>
    </div>

    <p>
      Movie Land is a personal, non-commercial project. It has no ads, no accounts and no paid features. On your device
      it saves only your dark mode choice and your bookmarks, and the bookmarks are just TMDB ids: titles are fetched
      again from TMDB each time. Browse filters live in the page address, so you can share a search by copying the link.
    </p>

    <p>
      Built with Vue 3, Vite and Bootstrap. The source code is on
      <a href="https://github.com/developerdii/movie-land" target="_blank" rel="noopener noreferrer">GitHub</a>.
    </p>
  </article>
</template>

<script setup>
// The official TMDB logo, as TMDB publishes it (themoviedb.org/about/logos-attribution).
const TMDB_LOGO = 'https://www.themoviedb.org/assets/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg'
</script>

<style lang="scss">
.about-page {
  color: var(--ml-muted);
  font-size: 16px;
  line-height: 1.7;
}

.about-page p { margin: 0 0 1rem; }
/* The card's own padding is the only space below the last line, so the card height matches the text. */
.about-page > :last-child { margin-bottom: 0; }

.about-title {
  margin: 0 0 1rem;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--ml-ink);
}

.about-page a {
  color: var(--ml-ink);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.about-page a:hover { color: var(--ml-brand-accent); }
.about-page a:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 3px; border-radius: 4px; }

.about-credit { margin: 1.5rem 0 2rem; }

/* The logo sits on white, as TMDB supplies it, so it reads in dark mode too. */
.about-credit-logo {
  display: inline-flex;
  padding: 6px 10px;
  margin-bottom: 12px;
  border: 1px solid var(--ml-line);
  border-radius: 8px;
  background: #fff;
  text-decoration: none;
}
.about-credit-logo img { display: block; height: 16px; width: auto; }

.about-credit-notice { font-weight: 600; color: var(--ml-ink); }
</style>
