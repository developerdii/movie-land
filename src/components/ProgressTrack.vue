<template>
  <div
    ref="trackEl"
    class="progress-track"
    :class="{ 'is-dragging': dragging }"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-valuemin="1"
    :aria-valuemax="pageCount"
    :aria-valuenow="value"
    :aria-valuetext="`${label} ${value} of ${pageCount}`"
    :aria-disabled="disabled"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
  >
    <div class="progress-track-line">
      <div class="progress-track-fill" :style="{ width: fill }"></div>
    </div>
    <span class="progress-track-knob" :style="{ left: fill }" aria-hidden="true"></span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// A horizontal track for the progress controls: a thin line filled up to the current page. A click moves to the page
// under the pointer, a drag moves through the pages as the pointer crosses them, and the arrow, Home and End keys work
// when it has focus. The track only reports the page it wants (`change`); the parent decides what that does, so a
// parent that moves its page in steps can keep up with the pointer. `value` is 1-based.
const props = defineProps({
  value: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: 'Page' }
})

const emit = defineEmits(['change'])

const trackEl = ref(null)
const dragging = ref(false)
const fill = computed(() => `${(props.value / props.pageCount) * 100}%`)

function request(page) {
  if (props.disabled || page === props.value || page < 1 || page > props.pageCount) return
  emit('change', page)
}

// The page under a horizontal pointer position: the left edge is page 1, the right edge the last page.
function pageAt(clientX) {
  const rect = trackEl.value.getBoundingClientRect()
  const ratio = rect.width ? (clientX - rect.left) / rect.width : 0
  return Math.min(props.pageCount, Math.max(1, Math.ceil(ratio * props.pageCount)))
}

function onPointerDown(event) {
  if (props.disabled) return
  dragging.value = true
  trackEl.value.setPointerCapture(event.pointerId)
  request(pageAt(event.clientX))
}

function onPointerMove(event) {
  if (dragging.value) request(pageAt(event.clientX))
}

function onPointerUp() {
  dragging.value = false
}

const STEP_KEYS = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }

function onKeydown(event) {
  if (props.disabled) return
  let page
  if (event.key in STEP_KEYS) page = props.value + STEP_KEYS[event.key]
  else if (event.key === 'Home') page = 1
  else if (event.key === 'End') page = props.pageCount
  else return
  event.preventDefault()
  request(page)
}
</script>

<style lang="scss">
/* The line and the knob take the parent's --progress-line, --progress-fill and --progress-ring when it sets them, so the
   hero can use its own dark colours. */
.progress-track {
  position: relative;
  flex: 0 1 200px;
  width: 200px;
  min-width: 60px;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  outline: none;
}
.progress-track[aria-disabled="true"] { cursor: default; }
.progress-track.is-dragging { cursor: grabbing; }
.progress-track:focus-visible { outline: 2px solid var(--ml-brand-accent); outline-offset: 2px; border-radius: 999px; }

/* The track is taller than its line, so it is easy to point at. Only the line and a knob change on hover. */
.progress-track-line {
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: var(--progress-line, var(--ml-control-line));
  transition: height .15s ease;
}
.progress-track:hover .progress-track-line,
.progress-track.is-dragging .progress-track-line { height: 5px; }

.progress-track-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--progress-fill, var(--ml-brand-accent));
  transition: width .3s ease;
}
.progress-track.is-dragging .progress-track-fill { transition: none; }

.progress-track-knob {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--progress-fill, var(--ml-brand-accent));
  box-shadow: 0 0 0 2px var(--progress-ring, var(--ml-surface));
  opacity: 0;
  transform: translate(-50%, -50%) scale(.6);
  pointer-events: none;
  transition: opacity .15s ease, transform .15s ease, left .3s ease;
}
.progress-track:hover .progress-track-knob,
.progress-track:focus-visible .progress-track-knob,
.progress-track.is-dragging .progress-track-knob {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.progress-track.is-dragging .progress-track-knob { transition: none; }
</style>
