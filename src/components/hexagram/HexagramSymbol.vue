<template>
  <g class="hexagram-container">
    <!-- 卦象背景 - 使用圆角矩形 -->
    <rect
      :x="x - width / 2"
      :y="y - height / 2"
      :width="width"
      :height="height"
      :rx="borderRadius"
      :ry="borderRadius"
      fill="white"
      :stroke="strokeColor"
      stroke-width="0.5"
      :opacity="opacity"
      class="hexagram-bg"
    />
    
    <!-- 卦名 -->
    <text
      :x="x"
      :y="y"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="fontSize"
      :fill="textColor"
      class="hexagram-name"
    >
      {{ name }}
    </text>
    
    <!-- 卦象线条 (如果提供) -->
    <g v-if="showLines" class="hexagram-lines" :transform="`translate(${x + width / 2 + 5}, ${y - height / 2})`">
      <g v-for="(line, index) in hexagramLines" :key="index" :transform="`translate(0, ${index * 5})`">
        <line 
          x1="0" 
          y1="0" 
          x2="10" 
          y2="0" 
          :stroke="textColor" 
          stroke-width="1.5"
          v-if="line === '1'"
        />
        <g v-else>
          <line x1="0" y1="0" x2="4" y2="0" :stroke="textColor" stroke-width="1.5" />
          <line x1="6" y1="0" x2="10" y2="0" :stroke="textColor" stroke-width="1.5" />
        </g>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  name: {
    type: String,
    required: true
  },
  binary: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 30
  },
  height: {
    type: Number,
    default: 20
  },
  borderRadius: {
    type: Number,
    default: 5
  },
  fontSize: {
    type: Number,
    default: 12
  },
  textColor: {
    type: String,
    default: '#8B4513'
  },
  strokeColor: {
    type: String,
    default: 'url(#circleStrokeGradient)'
  },
  opacity: {
    type: Number,
    default: 0.9
  },
  showLines: {
    type: Boolean,
    default: false
  }
});

// 将二进制字符串转换为卦象线条数组
const hexagramLines = computed(() => {
  if (!props.binary) return [];
  return props.binary.split('').reverse();
});
</script>

<style scoped>
.hexagram-bg:hover {
  fill: #f9f4e8;
  stroke-width: 1;
  transition: all 0.3s ease;
}

.hexagram-name {
  pointer-events: none;
}
</style>