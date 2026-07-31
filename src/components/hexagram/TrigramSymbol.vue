<template>
  <g class="trigram-container">
    <!-- 卦象背景 -->
    <circle
      :cx="x"
      :cy="y"
      :r="radius"
      fill="white"
      :stroke="strokeColor"
      stroke-width="1"
      class="trigram-bg"
    />

    <!-- 卦象符号 -->
    <text
      :x="x"
      :y="y"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="fontSize"
      :fill="textColor"
      class="trigram-symbol"
    >
      {{ symbol }}
    </text>

    <!-- 卦名 -->
    <text
      :x="x"
      :y="y + radius + 5"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="fontSize * 0.7"
      :fill="textColor"
      class="trigram-name"
    >
      {{ name }}
    </text>
  </g>
</template>

<script setup lang="ts">
// 组件属性
const props = defineProps({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  radius: {
    type: Number,
    default: 25
  },
  fontSize: {
    type: Number,
    default: 24
  },
  textColor: {
    type: String,
    default: '#8B4513'
  },
  strokeColor: {
    type: String,
    default: 'url(#circleStrokeGradient)'
  }
});
</script>

<style scoped>
.trigram-bg:hover {
  fill: #f9f4e8;
  transition: fill 0.3s ease;
}

.trigram-symbol, .trigram-name {
  pointer-events: none;
}
</style>