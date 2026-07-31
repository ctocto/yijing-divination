<template>
  <div class="compass-core" :class="`state-${state}`">
    <svg class="compass-svg" :viewBox="`0 0 ${SIZE} ${SIZE}`" @click.self="clearSelection">
      <!-- 外圈底色 -->
      <rect :x="4" :y="4" :width="SIZE - 8" :height="SIZE - 8" rx="20" fill="#fffdf6" :stroke="theme.gold" stroke-width="2" />

      <!-- 旋转组：盘面 + 刻度 + 卦图一起旋转 -->
      <g :transform="`rotate(${rotation} ${C} ${C})`">
        <CompassRing :center="C" :disc-radius="DISC_RADIUS" />
        <ScaleRing :center="C" />
        <HexagramRing :center="C" />
      </g>

      <!-- 固定指针（不随旋转） -->
      <path :d="pointerPath" :fill="theme.cinnabar" />

      <!-- 中心太极（静止，双击回到闲观态） -->
      <g class="taiji-center" @dblclick="resetToIdle">
        <TaijiSymbol :centerX="C" :centerY="C" :radius="60" :strokeColor="'#2c2416'" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import CompassRing from './CompassRing.vue'
import ScaleRing from './ScaleRing.vue'
import HexagramRing from './HexagramRing.vue'
import TaijiSymbol from '../hexagram/TaijiSymbol.vue'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

const SIZE = 720
const C = SIZE / 2
const DISC_RADIUS = 195

const { state, rotation, clearSelection, resetToIdle } = useCompass()

// 朱砂指针：顶部倒三角，尖端指向盘面上缘（仅依赖模块级常量，非响应式）
const pointerPath = `M ${C - 14} ${C - DISC_RADIUS - 42} L ${C + 14} ${C - DISC_RADIUS - 42} L ${C} ${C - DISC_RADIUS + 4} Z`
</script>

<style scoped>
.compass-core {
  position: absolute;
  width: 700px;
  transform-origin: top left;
  transition: top 0.6s ease-out, left 0.6s ease-out, transform 0.6s ease-out;
}
.compass-svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}
.taiji-center {
  cursor: default;
}
.compass-core.state-idle,
.compass-core.state-spinning {
  top: calc(50% - 350px);
  left: calc(50% - 350px);
  transform: scale(1);
}
.compass-core.state-reading {
  top: 16px;
  left: 16px;
  transform: scale(0.2286);
  z-index: 10;
}
</style>
