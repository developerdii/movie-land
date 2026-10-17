<template>
  <div class="poster-card-skeleton" aria-hidden="true">
    <div class="poster-card-skeleton__media skeleton-shimmer"></div>
    <div class="poster-card-skeleton__info">
      <span class="poster-card-skeleton__bar poster-card-skeleton__bar--title skeleton-shimmer"></span>
      <span class="poster-card-skeleton__bar poster-card-skeleton__bar--sub skeleton-shimmer"></span>
    </div>
  </div>
</template>

<script setup>
// Placeholder with the same proportions as PosterCard (2:3 media, info band below), so the grid does not jump when results arrive.
</script>

<style lang="scss">
/* Shared shimmer for loading placeholders. Motion is dropped for reduced-motion users. */
.skeleton-shimmer {
  background: linear-gradient(90deg, var(--ml-skeleton) 25%, var(--ml-skeleton-hi) 37%, var(--ml-skeleton) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer { animation: none; }
}

.poster-card-skeleton {
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: var(--ml-surface);
  box-shadow: 0 2px 4px rgba(var(--ml-brand-dark-rgb), .04), 0 10px 24px rgba(var(--ml-brand-dark-rgb), .08);
}

.poster-card-skeleton__media {
  aspect-ratio: 2 / 3;
  width: 100%;
}

.poster-card-skeleton__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 96px;
  padding: 14px 16px 16px;
}

.poster-card-skeleton__bar {
  display: block;
  height: 12px;
  border-radius: 6px;
}
.poster-card-skeleton__bar--title { width: 80%; height: 14px; }
.poster-card-skeleton__bar--sub { width: 50%; }
</style>
