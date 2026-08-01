<template>
  <g class="hex-lines" :class="`state-${state}`">
    <g
      v-for="(li, idx) in lines"
      :key="idx"
      :transform="`translate(0, ${(idx - 2.5) * gap})`"
    >
      <rect
        v-if="li === '1'"
        :x="-len / 2"
        :y="-thick / 2"
        :width="len"
        :height="thick"
        rx="1"
        class="hex-line"
      />
      <template v-else>
        <rect :x="-len / 2" :y="-thick / 2" :width="len * 0.42" :height="thick" rx="1" class="hex-line" />
        <rect :x="len * 0.08" :y="-thick / 2" :width="len * 0.42" :height="thick" rx="1" class="hex-line" />
      </template>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  binary: { type: String, required: true }, // 六爻二进制，自下而上
  size: { type: Number, default: 24 },      // 卦线总宽
  state: { type: String, default: 'normal' }, // normal | hover | selected | casting
})

const lines = computed(() => props.binary.split(''))
const len = computed(() => props.size)
const thick = computed(() => Math.max(1.6, props.size * 0.16))
const gap = computed(() => props.size * 0.42)
</script>

<style scoped>
.hex-line {
  fill: var(--ink);
  transition: fill 0.15s, transform 0.15s;
}
.state-hover .hex-line {
  fill: var(--gold);
}
.state-selected .hex-line {
  fill: var(--cinnabar);
}
.state-casting .hex-line {
  fill: var(--cinnabar);
  animation: glyph-pulse 0.45s ease 2;
}
@keyframes glyph-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
</style>
