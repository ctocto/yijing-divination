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
      <p class="colloquial-plain">{{ result?.plain }}</p>
      <p class="colloquial-hint">{{ colloquialHint }}</p>
    </div>

    <!-- 操作：复制解读 / 再起一卦 -->
    <div class="action-row">
      <button class="copy-btn" type="button" @click="onCopy">{{ copied ? '已复制' : '复制解读' }}</button>
      <button class="restart-btn" type="button" @click="resetToIdle">再起一卦</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompass } from '@/composables/useCompass'
import { useCopy } from '@/composables/useCopy'
import { buildHexagramText } from '@/utils/hexagramText'

const { divinationResult, direction, resetToIdle } = useCompass()
const { copied, copyText } = useCopy()

const result = computed(() => divinationResult.value)
const displayLines = computed(() => result.value?.binary.split('').reverse() || [])

// 依阴阳结构给一句大白话提示
const colloquialHint = computed(() => {
  if (!result.value) return ''
  const binary = result.value.binary
  const yang = (binary.match(/1/g) || []).length
  let hint
  if (yang === 6) {
    hint = '六爻皆阳，气势刚健——做事可以果断些，但别太过张扬'
  } else if (yang === 0) {
    hint = '六爻皆阴，性情柔顺——宜脚踏实地、顺势而为，不宜争先'
  } else if (yang >= 4) {
    hint = '阳多阴少，刚劲为主——做事要有冲劲，但记得刚柔相济、别用力过猛'
  } else if (yang <= 2) {
    hint = '阴多阳少，力量内敛——宜稳住、积蓄、等待时机，不必急着冒进'
  } else {
    hint = '阴阳均衡，动静相宜——顺其自然、按部就班即可'
  }
  return direction.value ? `结合当前方向「${direction.value}」，${hint}` : hint
})

function onCopy() {
  copyText(buildHexagramText(result.value, direction.value))
}
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
.colloquial-plain {
  font-size: 15px;
  color: var(--ink);
  line-height: 1.9;
  margin: 0 0 10px;
}
.colloquial-hint {
  font-size: 13px;
  color: var(--ink-light);
  line-height: 1.7;
  margin: 0;
  padding-top: 10px;
  border-top: 1px dashed var(--gold-light);
}
.action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.copy-btn {
  padding: 10px 24px;
  font-size: 15px;
  border: 1px solid var(--gold);
  border-radius: 6px;
  background: transparent;
  color: var(--ink);
  letter-spacing: 0.12em;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}
.copy-btn:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.05);
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
