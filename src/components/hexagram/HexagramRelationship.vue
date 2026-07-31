<template>
  <g class="hexagram-relationship">
    <!-- 连接线 -->
    <path
      :d="connectionPath"
      :stroke="strokeColor"
      stroke-width="1"
      fill="none"
      stroke-dasharray="3,2"
      class="connection-line"
    />
    
    <!-- 关系文字 -->
    <g v-if="showText" class="relationship-text">
      <rect
        :x="textX - textWidth / 2"
        :y="textY - 10"
        :width="textWidth"
        :height="20"
        rx="5"
        ry="5"
        fill="rgba(255, 255, 255, 0.7)"
      />
      <text
        :x="textX"
        :y="textY"
        text-anchor="middle"
        dominant-baseline="middle"
        :font-size="fontSize"
        :fill="textColor"
      >
        {{ relationshipText }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 组件属性
const props = defineProps({
  x1: {
    type: Number,
    required: true
  },
  y1: {
    type: Number,
    required: true
  },
  x2: {
    type: Number,
    required: true
  },
  y2: {
    type: Number,
    required: true
  },
  relationshipType: {
    type: String,
    default: 'transform' // 'transform', 'opposite', 'complement', etc.
  },
  relationshipText: {
    type: String,
    default: ''
  },
  strokeColor: {
    type: String,
    default: '#8B4513'
  },
  textColor: {
    type: String,
    default: '#8B4513'
  },
  fontSize: {
    type: Number,
    default: 10
  },
  textWidth: {
    type: Number,
    default: 40
  },
  showText: {
    type: Boolean,
    default: true
  }
});

// 计算连接路径
const connectionPath = computed(() => {
  // 计算控制点，使线条有弧度
  const dx = props.x2 - props.x1;
  const dy = props.y2 - props.y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 控制点偏移量，使曲线更自然
  const offset = distance / 4;
  
  // 计算垂直于连线的方向
  const nx = -dy / distance;
  const ny = dx / distance;
  
  // 控制点
  const cx = (props.x1 + props.x2) / 2 + nx * offset;
  const cy = (props.y1 + props.y2) / 2 + ny * offset;
  
  return `M ${props.x1} ${props.y1} Q ${cx} ${cy} ${props.x2} ${props.y2}`;
});

// 计算文本位置 (曲线中点)
const textX = computed(() => {
  const dx = props.x2 - props.x1;
  const dy = props.y2 - props.y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 控制点偏移量
  const offset = distance / 4;
  
  // 计算垂直于连线的方向
  const nx = -dy / distance;
  const ny = dx / distance;
  
  // 文本位置 (曲线中点)
  return (props.x1 + props.x2) / 2 + nx * offset;
});

const textY = computed(() => {
  const dx = props.x2 - props.x1;
  const dy = props.y2 - props.y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 控制点偏移量
  const offset = distance / 4;
  
  // 计算垂直于连线的方向
  const nx = -dy / distance;
  const ny = dx / distance;
  
  // 文本位置 (曲线中点)
  return (props.y1 + props.y2) / 2 + ny * offset;
});
</script>

<style scoped>
.connection-line {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.connection-line:hover {
  opacity: 1;
  stroke-width: 1.5;
}

.relationship-text {
  pointer-events: none;
}
</style>