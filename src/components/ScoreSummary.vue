<template>
  <div class="score-summary">
    <div v-if="hasScore" class="score-summary-score" role="img" :aria-label="scoreLabel">
      <svg class="score-summary-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle class="score-summary-track" cx="32" cy="32" r="28" />
        <circle class="score-summary-arc" cx="32" cy="32" r="28" :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="arcOffset" />
      </svg>
      <span class="score-summary-value" aria-hidden="true">{{ score.toFixed(1) }}</span>
    </div>

    <div v-if="hasScore" class="score-summary-votes">
      <span class="score-summary-label">User score</span>
      <span v-if="votes" class="score-summary-count" :title="exactVoteCount(votes)">{{ formatVoteCount(votes) }}</span>
    </div>

    <div v-if="hasScore && facts.length" class="score-summary-divider" aria-hidden="true"></div>

    <div v-if="facts.length" class="score-summary-facts">
      <span v-for="(fact, index) in facts" :key="index" class="score-summary-fact" :class="{ 'is-primary': index === 0 }">{{ fact }}</span>
    </div>
  </div>
</template>

<script setup>
// The rating block on movie and TV pages: a gold ring with the score, the vote count, and two lines of facts
// (the first line is the emphasised one, e.g. the release date or the air dates).
import { computed } from 'vue'
import { exactVoteCount, formatVoteCount } from '@/utils/votes'

const props = defineProps({
  score: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  facts: { type: Array, default: () => [] }
})

const CIRCUMFERENCE = 2 * Math.PI * 28
const hasScore = computed(() => props.score > 0)
const arcOffset = computed(() => CIRCUMFERENCE * (1 - props.score / 10))
const scoreLabel = computed(() => (
  `User score ${props.score.toFixed(1)} out of 10` + (props.votes ? `, from ${exactVoteCount(props.votes)}` : '')
))
</script>

<style lang="scss">
.score-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 22px;
}

.score-summary-score {
  position: relative;
  flex: none;
  width: 64px;
  height: 64px;
}

/* The ring starts at the top (rotated -90°) and fills clockwise with the score out of 10. */
.score-summary-ring {
  display: block;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.score-summary-track { fill: none; stroke: var(--ml-control-line); stroke-width: 5; }
.score-summary-arc { fill: none; stroke: var(--ml-brand-accent); stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset .4s ease; }

.score-summary-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--ml-ink);
}

.score-summary-votes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-summary-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ml-muted);
}

.score-summary-count {
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--ml-ink);
}

.score-summary-divider {
  align-self: stretch;
  width: 1px;
  min-height: 48px;
  background: var(--ml-line);
}

.score-summary-facts {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.score-summary-fact {
  font-size: 17px;
  font-weight: 500;
  color: var(--ml-text-2);
}
.score-summary-fact.is-primary {
  font-size: 19px;
  font-weight: 700;
  color: var(--ml-ink);
}

/* Phones: the ring stays beside the votes; the facts drop under them and the divider goes. */
@media (max-width: 575.98px) {
  .score-summary-score { width: 56px; height: 56px; }
  .score-summary-value { font-size: 16px; }
  .score-summary-divider { display: none; }
  .score-summary-facts { flex-basis: 100%; }
}
</style>
