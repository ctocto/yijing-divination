<template>
  <g class="scale-ring">
    <!-- 环线 -->
    <circle :cx="center" :cy="center" :r="218" fill="none" :stroke="theme.gold" stroke-width="1" />
    <circle :cx="center" :cy="center" :r="285" fill="none" :stroke="theme.goldLight" stroke-width="0.6" />
    <!-- 扇区分隔线 -->
    <line
      v-for="i in 8"
      :key="`div-${i}`"
      :x1="center + 218 * Math.cos(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :y1="center + 218 * Math.sin(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :x2="center + 285 * Math.cos(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :y2="center + 285 * Math.sin(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :stroke="theme.goldLight"
      stroke-width="0.6"
    />
    <!-- 每宫标注 -->
    <g v-for="(t, i) in trigrams" :key="t.name">
      <text
        :x="center + 236 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 236 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="15"
        :fill="theme.ink"
      >{{ t.trigram }}</text>
      <text
        :x="center + 254 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 254 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="11"
        :fill="theme.inkLight"
      >{{ t.name }} {{ t.wuxing }}</text>
      <text
        :x="center + 272 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 272 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="10"
        :fill="theme.inkLight"
      >{{ t.heavenlyStem }} {{ t.earthlyBranch }}</text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { trigrams } from '@/data/trigrams'
import { theme } from '@/styles/theme'

defineProps({
  center: { type: Number, required: true },
})
</script>
