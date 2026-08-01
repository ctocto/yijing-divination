<template>
  <g
    class="hexagram-glyph"
    :class="{ highlighted, selected }"
    @click.stop="$emit('click')"
  >
    <rect :x="x - 17" :y="y - 13" width="34" height="26" rx="5" class="glyph-bg" :stroke="theme.gold" stroke-width="0.8" />
    <text
      :x="x"
      :y="y + 7"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="11"
      font-weight="bold"
      class="glyph-name"
    >{{ hexagram.name }}</text>
    <!-- 迷你六爻线 -->
    <g :transform="`translate(${x - 8}, ${y - 11})`">
      <g v-for="(line, li) in displayLines" :key="li" :transform="`translate(0, ${li * 1.7})`">
        <rect v-if="line === '1'" x="0" y="0" width="16" height="1.4" class="glyph-line" />
        <g v-else>
          <rect x="0" y="0" width="6.5" height="1.4" class="glyph-line" />
          <rect x="9.5" y="0" width="6.5" height="1.4" class="glyph-line" />
        </g>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme } from '@/styles/theme'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  hexagram: { type: Object, required: true },
  highlighted: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
defineEmits(['click'])

const displayLines = computed(() => props.hexagram?.binary.split('').reverse() || [])
</script>

<style scoped>
.glyph-bg {
  fill: #fffdf6;
  transition: fill 0.2s, stroke-width 0.2s;
}
.glyph-name {
  fill: var(--ink);
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  pointer-events: none;
}
.glyph-line {
  fill: var(--ink);
  pointer-events: none;
}
.hexagram-glyph { cursor: pointer; }
.hexagram-glyph:hover .glyph-bg { fill: var(--gold-light); stroke-width: 1.2; }
.hexagram-glyph.selected .glyph-bg { fill: #f2d5cf; stroke: var(--cinnabar); stroke-width: 1.5; }
.hexagram-glyph.selected .glyph-name,
.hexagram-glyph.selected .glyph-line { fill: var(--cinnabar); }
.hexagram-glyph.highlighted .glyph-bg { fill: #f2d5cf; stroke: var(--cinnabar); stroke-width: 1.5; }
.hexagram-glyph.highlighted .glyph-name,
.hexagram-glyph.highlighted .glyph-line { fill: var(--cinnabar); }
.hexagram-glyph.highlighted {
  transform-box: fill-box;
  transform-origin: center;
  animation: glyph-pulse 0.4s ease 2;
}
@keyframes glyph-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
