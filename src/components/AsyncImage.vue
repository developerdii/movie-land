<template>
  <div class="media-image-frame" :class="frameClass" :style="frameStyle" :role="!src || hasFailed ? 'img' : undefined" :aria-label="!src || hasFailed ? alt : undefined">
    <div v-if="!isLoaded" class="media-image-placeholder" aria-hidden="true">
      <i :class="placeholderIcon" aria-hidden="true"></i>
    </div>
    <img
      v-if="src && !hasFailed"
      class="media-image"
      :class="[imageClass, { 'is-loaded': isLoaded }]"
      :src="src"
      :alt="alt"
      :style="{ objectFit }"
      loading="lazy"
      decoding="async"
      @load="isLoaded = true"
      @error="hasFailed = true; isLoaded = false"
    >
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  kind: { type: String, default: 'movie' },
  aspectRatio: { type: String, default: '2 / 3' },
  frameClass: { type: [String, Array, Object], default: '' },
  imageClass: { type: [String, Array, Object], default: '' },
  objectFit: { type: String, default: 'cover' }
})

const isLoaded = ref(false)
const hasFailed = ref(false)
const placeholderIcon = computed(() => props.kind === 'person' ? 'bi bi-person-fill' : 'bi bi-film')
const frameStyle = computed(() => ({ aspectRatio: props.aspectRatio }))

watch(() => props.src, () => {
  isLoaded.value = false
  hasFailed.value = false
})
</script>
