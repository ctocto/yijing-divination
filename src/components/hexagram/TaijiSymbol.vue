<template>
  <g class="taiji-symbol">
    <!-- 太极外圆 -->
    <circle
      :cx="centerX"
      :cy="centerY"
      :r="radius"
      fill="white"
      :stroke="strokeColor"
      stroke-width="1.5"
      class="taiji-circle"
    />
    
    <!-- 太极图案 -->
    <g :clip-path="`url(#${clipId})`">
      <!-- 白色半边 -->
      <path
        :d="`M ${centerX} ${centerY-radius} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY+radius} A ${radius/2} ${radius/2} 0 0 1 ${centerX} ${centerY} A ${radius/2} ${radius/2} 0 0 0 ${centerX} ${centerY-radius} Z`"
        fill="white"
      />
      
      <!-- 黑色半边 -->
      <path
        :d="`M ${centerX} ${centerY-radius} A ${radius} ${radius} 0 0 0 ${centerX} ${centerY+radius} A ${radius/2} ${radius/2} 0 0 0 ${centerX} ${centerY} A ${radius/2} ${radius/2} 0 0 1 ${centerX} ${centerY-radius} Z`"
        fill="black"
      />
    </g>
    
    <!-- 阴阳点 -->
    <circle
      :cx="centerX"
      :cy="centerY - radius/2"
      :r="radius/10"
      fill="black"
    />
    <circle
      :cx="centerX"
      :cy="centerY + radius/2"
      :r="radius/10"
      fill="white"
    />
    
    <!-- 剪切路径定义 -->
    <clipPath :id="clipId">
      <circle :cx="centerX" :cy="centerY" :r="radius" />
    </clipPath>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 组件属性
const props = defineProps({
  centerX: {
    type: Number,
    required: true
  },
  centerY: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    default: 50
  },
  strokeColor: {
    type: String,
    default: 'url(#circleStrokeGradient)'
  }
});

// 生成唯一的剪切路径ID
const clipId = computed(() => `taijiClip-${Math.random().toString(36).substring(2, 9)}`);
</script>

<style scoped>
.taiji-circle:hover {
  filter: brightness(1.1);
  transition: filter 0.3s ease;
}
</style>