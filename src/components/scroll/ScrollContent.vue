<template>
  <div class="scroll-content">
    <!-- 方向选择 -->
    <div class="direction-row">
      <label for="scroll-direction">所问何事：</label>
      <select id="scroll-direction" v-model="selectedDirection">
        <option value="">无方向（开放问题）</option>
        <option value="事业">事业</option>
        <option value="情感">情感</option>
        <option value="健康">健康</option>
        <option value="学业">学业</option>
        <option value="财富">财富</option>
        <option value="家庭">家庭</option>
        <option value="其他">其他（请填写下方）</option>
      </select>
      <input
        v-if="selectedDirection === '其他'"
        v-model="customDirection"
        type="text"
        placeholder="请输入自定义方向"
        class="direction-input"
      />
    </div>

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

const { divinationResult, selectedDirection, customDirection, direction, resetToIdle } = useCompass()

const result = computed(() => divinationResult.value)
const displayLines = computed(() => result.value?.binary.split('').reverse() || [])

const colloquialText = computed(() => {
  if (!result.value) return '——'
  const name = result.value.name
  const text = result.value.text
  const dir = direction.value ? `结合当前方向「${direction.value}」` : '结合当前情况'
  return `此卦为「${name}」，卦辞曰：${text}。${dir}，更需顺应时势、审时度势，从容应对。`
})
</script>

<style scoped>
.scroll-content {
  text-align: center;
  color: var(--ink);
}
.direction-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  font-size: 14px;
}
.direction-row select,
.direction-input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid var(--gold);
  border-radius: 4px;
  background: #fffdf6;
  color: var(--ink);
}
.direction-input { width: 150px; }

.hexagram-figure { margin: 8px auto 4px; }

.hexagram-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 48px;
  color: var(--cinnabar);
  margin: 12px 0 8px;
}
.hexagram-text {
  font-size: 18px;
  color: var(--ink);
  margin: 0 0 24px;
  line-height: 1.9;
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
  box-shadow: 0 4px 16px rgba(192, 57, 43, 0.4);
}
.figure-line {
  stroke: var(--ink);
  stroke-width: 7;
}
</style>
