<template>
  <button
    type="button"
    class="ml-theme-toggle"
    :class="{ 'is-dark': isDark }"
    aria-label="Dark mode"
    :aria-pressed="isDark"
    title="Dark mode"
    @click="toggle"
  >
    <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon-stars'" aria-hidden="true"></i>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getStoredTheme, setTheme } from '@/utils/theme'

const theme = ref(getStoredTheme())
const isDark = computed(() => theme.value === 'dark')

function toggle() {
  theme.value = isDark.value ? 'light' : 'dark'
  setTheme(theme.value)
}
</script>

<style lang="scss">
.ml-theme-toggle {
  flex: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid var(--ml-control-line);
  border-radius: 12px;
  background: var(--ml-surface);
  color: var(--ml-ink);
  font-size: 1.05rem;
  cursor: pointer;
  transition: border-color .15s ease, color .15s ease, background-color .15s ease;
}
.ml-theme-toggle:hover { border-color: var(--ml-brand-accent); color: var(--ml-brand-accent); }
.ml-theme-toggle.is-dark { background: var(--ml-control-bg); }
.ml-theme-toggle:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; }
</style>
