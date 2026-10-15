<template>
  <p>
    <i class="bi bi-star-fill" style="color: var(--ml-brand-accent)"></i> {{ value.toFixed(1) + ' / 10' }}
  </p>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: 0
  }
})
</script>
