<template>
  <g class="scale-ring">
    <!-- 环线 -->
    <circle :cx="center" :cy="center" :r="205" fill="none" :stroke="theme.gold" stroke-width="1" />
    <circle :cx="center" :cy="center" :r="265" fill="none" :stroke="theme.goldLight" stroke-width="0.6" />
    <!-- 扇区分隔线 -->
    <line
      v-for="i in 8"
      :key="`div-${i}`"
      :x1="center + 205 * Math.cos(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :y1="center + 205 * Math.sin(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :x2="center + 265 * Math.cos(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :y2="center + 265 * Math.sin(((i - 1) * 45 - 90 + 22.5) * Math.PI / 180)"
      :stroke="theme.goldLight"
      stroke-width="0.6"
    />
    <!-- 每宫标注 -->
    <g v-for="(t, i) in trigrams" :key="t.name">
      <text
        :x="center + 220 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 220 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="15"
        :fill="theme.ink"
      >{{ t.trigram }}</text>
      <text
        :x="center + 238 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 238 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="11"
        :fill="theme.inkLight"
        class="fine-label"
      >{{ t.name }} {{ t.wuxing }}</text>
      <text
        :x="center + 256 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 256 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="10"
        :fill="theme.inkLight"
        class="fine-label"
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

<style scoped>
/* 移动端视口窄小，隐藏细小标注（五行名 / 天干地支），仅保留八卦符 */
@media (max-width: 600px) {
  .fine-label {
    display: none;
  }
}
</style>
