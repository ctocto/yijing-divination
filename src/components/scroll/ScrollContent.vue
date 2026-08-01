<template>
  <div class="scroll-content">
    <!-- 卦符图：六爻线 -->
    <div class="hexagram-figure">
      <svg viewBox="0 0 80 160" width="80" height="160">
        <g v-for="(line, i) in displayLines" :key="i">
          <line
            v-if="line === '1'"
            :x1="10" :x2="70"
            :y1="12 + i * 26" :y2="12 + i * 26"
            class="figure-line" stroke-linecap="round"
          />
          <g v-else>
            <line :x1="10" :x2="33" :y1="12 + i * 26" :y2="12 + i * 26" class="figure-line" stroke-linecap="round" />
            <line :x1="47" :x2="70" :y1="12 + i * 26" :y2="12 + i * 26" class="figure-line" stroke-linecap="round" />
          </g>
        </g>
      </svg>
    </div>

    <!-- 卦名 -->
    <h1 class="hexagram-name">{{ result?.name }}</h1>

    <!-- 卦辞 -->
    <p class="hexagram-text">{{ result?.text }}</p>

    <!-- 爻辞 -->
    <div class="line-texts">
      <p v-for="(line, i) in result?.lines || []" :key="i" class="line-text">
        <span class="dot" />{{ line }}
      </p>
    </div>

    <!-- 白话解读 -->
    <div class="colloquial">
      <h3>白话解读</h3>
      <p>{{ colloquialText }}</p>
    </div>

    <!-- 再起一卦 -->
    <button class="restart-btn" @click="resetToIdle">再起一卦</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompass } from '@/composables/useCompass'

const { divinationResult, direction, resetToIdle } = useCompass()

const result = computed(() => divinationResult.value)
const displayLines = computed(() => result.value?.binary.split('').reverse() || [])

const colloquialText = computed(() => {
  if (!result.value) return '——'
  const { name, text, binary } = result.value
  const yang = (binary.match(/1/g) || []).length
  const yin = 6 - yang
  // 依阴阳结构给出克制的指引，避免每卦雷同的套话
  let structure, advice
  if (yang === 6) {
    structure = '六爻皆阳，纯阳之象'
    advice = '其势刚健，行动宜果决而不失节制'
  } else if (yang === 0) {
    structure = '六爻皆阴，纯阴之象'
    advice = '其性柔顺，宜守静安贞，顺时而动'
  } else if (yang >= 4) {
    structure = `阳盛阴弱（${yang} 阳 ${yin} 阴）`
    advice = '阳刚为主，宜刚柔相济，勿过亢'
  } else if (yang <= 2) {
    structure = `阴盛阳微（${yang} 阳 ${yin} 阴）`
    advice = '阴柔为主，宜守正待时，蓄势而发'
  } else {
    structure = `阴阳调和（${yang} 阳 ${yin} 阴）`
    advice = '刚柔相济，动静相宜，顺其自然'
  }
  const cleanText = text.endsWith('。') ? text.slice(0, -1) : text
  const dir = direction.value ? `结合当前方向「${direction.value}」` : '结合当下所问'
  return `「${name}」卦，${structure}。卦辞曰：${cleanText}。${dir}，${advice}。`
})
</script>

<style scoped>
.scroll-content {
  text-align: center;
  color: var(--ink);
}
.hexagram-figure { margin: 8px auto 4px; }

.hexagram-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 44px;
  color: var(--cinnabar);
  margin: 12px 0 10px;
}
.hexagram-text {
  font-size: 17px;
  line-height: 2;
  color: var(--ink);
  margin: 0 0 28px;
}
.line-texts {
  text-align: left;
  max-width: 460px;
  margin: 0 auto 24px;
  border-top: 1px dashed var(--gold-light);
  padding-top: 12px;
}
.line-text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.8;
  margin: 8px 0;
}
.dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cinnabar);
  align-self: center;
}
.colloquial {
  text-align: left;
  max-width: 460px;
  margin: 0 auto 32px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 14px 18px;
}
.colloquial h3 {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 18px;
  color: var(--cinnabar);
  margin: 0 0 8px;
}
.colloquial p {
  font-size: 14px;
  color: var(--ink-light);
  line-height: 1.8;
  margin: 0;
}
.restart-btn {
  padding: 10px 28px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  background: var(--cinnabar);
  color: #fffdf6;
  letter-spacing: 0.15em;
  transition: transform 0.15s, box-shadow 0.2s;
}
.restart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(178, 58, 46, 0.4);
}
.figure-line {
  stroke: var(--ink);
  stroke-width: 7;
}
</style>
