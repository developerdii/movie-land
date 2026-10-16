<template>
  <div class="section-heading">
    <div class="section-heading-body">
      <span v-if="eyebrow" class="section-heading-eyebrow">{{ eyebrow }}</span>
      <h2 class="section-heading-title">{{ title }}</h2>
    </div>
    <div v-if="$slots.actions" class="section-heading-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true }
})
</script>

<style lang="scss">
.section-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: .75rem;
  border-bottom: 2px solid var(--ml-brand-accent);
  margin-bottom: 1.5rem;
}

.section-heading-body { display: flex; flex-direction: column; gap: 8px; }

.section-heading-eyebrow {
  font-family: Manrope, "Helvetica Neue", sans-serif;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ml-brand-accent);
}

.section-heading-title {
  margin: 0;
  font-family: "Big Shoulders Display", "Arial Narrow", sans-serif;
  font-weight: 800;
  font-size: 52px;
  line-height: 0.9;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--ml-ink);
}

.section-heading-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

@media (max-width: 639.98px) {
  .section-heading-title { font-size: 38px; }
}
</style>
