<template>
  <g class="hexagram-description">
    <!-- 背景 -->
    <rect
      :x="x - width / 2"
      :y="y - height / 2"
      :width="width"
      :height="height"
      :rx="borderRadius"
      :ry="borderRadius"
      :fill="backgroundColor"
      :stroke="strokeColor"
      stroke-width="0.5"
      :opacity="opacity"
      class="description-bg"
    />
    
    <!-- 标题 -->
    <text
      :x="x"
      :y="y - height / 2 + titleFontSize + 2"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="titleFontSize"
      :font-weight="titleFontWeight"
      :fill="textColor"
      class="description-title"
    >
      {{ title }}
    </text>
    
    <!-- 内容 -->
    <text
      v-for="(line, index) in contentLines"
      :key="`line-${index}`"
      :x="x"
      :y="y - height / 2 + titleFontSize + 8 + (index + 1) * (contentFontSize + 2)"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="contentFontSize"
      :fill="textColor"
      class="description-content"
    >
      {{ line }}
    </text>
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
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  // 新增：问题方向（如事业、情感、健康等），用于内容模板选择
  direction: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 80
  },
  height: {
    type: Number,
    default: 60
  },
  borderRadius: {
    type: Number,
    default: 5
  },
  backgroundColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.8)'
  },
  strokeColor: {
    type: String,
    default: '#8B4513'
  },
  textColor: {
    type: String,
    default: '#8B4513'
  },
  titleFontSize: {
    type: Number,
    default: 12
  },
  titleFontWeight: {
    type: String,
    default: 'bold'
  },
  contentFontSize: {
    type: Number,
    default: 10
  },
  opacity: {
    type: Number,
    default: 0.9
  }
});
// direction 字段可用于后续根据不同方向切换内容模板

// 将内容分割成多行
const contentLines = computed(() => {
  if (!props.content) return [];
  
  // 根据宽度和字体大小估算每行字符数
  const charsPerLine = Math.floor(props.width / (props.contentFontSize * 0.8));
  
  // 分割内容
  const lines = [];
  let remainingContent = props.content;
  
  while (remainingContent.length > 0) {
    if (remainingContent.length <= charsPerLine) {
      lines.push(remainingContent);
      break;
    }
    
    // 尝试在空格处分割
    let cutIndex = remainingContent.substring(0, charsPerLine).lastIndexOf(' ');
    
    // 如果没有找到空格，则在字符处分割
    if (cutIndex === -1) {
      cutIndex = charsPerLine;
    }
    
    lines.push(remainingContent.substring(0, cutIndex));
    remainingContent = remainingContent.substring(cutIndex).trim();
  }
  
  return lines;
});
</script>

<style scoped>
.description-bg {
  transition: opacity 0.3s ease;
}

.description-bg:hover {
  opacity: 1;
}

.description-title, .description-content {
  pointer-events: none;
}
</style>