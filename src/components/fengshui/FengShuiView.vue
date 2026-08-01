<template>
  <div class="fs-view" role="dialog" aria-label="风水 · 罗盘宅运">
    <header class="fs-header">
      <h1 class="fs-title">风水 · 罗盘宅运</h1>
      <button
        class="fs-close"
        type="button"
        aria-label="关闭"
        @click="$emit('close')"
      >
        ×
      </button>
    </header>

    <div class="fs-body">
      <section class="fs-luopan">
        <Luopan :mountain="selectedDir" @select="selectedDir = $event" />
      </section>

      <section class="fs-controls">
        <div class="mode-toggle" role="group" aria-label="坐向口径">
          <button
            type="button"
            :class="{ active: mode === '坐山' }"
            @click="mode = '坐山'"
          >
            坐山
          </button>
          <button
            type="button"
            :class="{ active: mode === '朝向' }"
            @click="mode = '朝向'"
          >
            朝向
          </button>
        </div>

        <div class="period-row" role="group" aria-label="元运">
          <button
            v-for="p in 9"
            :key="p"
            type="button"
            class="period-btn"
            :class="{ active: period === p }"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
        <p class="period-range">{{ periodInfo }}</p>

        <p class="readout">坐{{ shan }}朝{{ xiang }}</p>
        <p class="overall-banner">
          <b>{{ overallInfo.name }}</b> —— {{ overallInfo.text }}
        </p>
      </section>

      <section class="fs-pan">
        <FlyingStarPan :judges="judges" :special="special" />
      </section>

      <section class="fs-reading">
        <h2>宅运解读</h2>
        <p class="advice">{{ overallInfo.advice }}</p>

        <h2>九宫分述</h2>
        <ul class="palace-list">
          <li v-for="j in judges" :key="j.palace" class="palace-line">
            <span class="palace-tag">{{ j.palace }}</span>
            <span class="lvl" :class="`lv-${j.level}`">{{ j.level }}</span>
            <span class="brief">{{ j.brief }}</span>
          </li>
        </ul>

        <h2>特殊方位</h2>
        <ul class="special-list">
          <li v-if="special.cai">
            财位：<b>{{ special.cai }}</b> —— {{ spText.cai.text }}
          </li>
          <li v-if="special.wen">
            文昌位：<b>{{ special.wen }}</b> —— {{ spText.wen.text }}
          </li>
          <li v-if="special.bing">
            病符位：<b>{{ special.bing }}</b> —— {{ spText.bing.text }}
          </li>
          <li v-if="special.sha">
            五黄煞：<b>{{ special.sha }}</b> —— {{ spText.sha.text }}
          </li>
        </ul>

        <p class="fs-disclaimer">玄空飞星 · 文化参考</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Luopan from './Luopan.vue';
import FlyingStarPan from './FlyingStarPan.vue';
import { yunPeriods } from '@/data/luopan';
import {
  overallJudgments,
  specialPositions as spText,
} from '@/data/flyingStars';
import {
  buildPan,
  overallJudge,
  specialPositions,
  palaceJudges,
  oppositeMountain,
} from '@/utils/fengShui';

defineEmits(['close']);

const mode = ref('坐山'); // '坐山' | '朝向'
const selectedDir = ref('子'); // 红针所指 24 山（默认坐子朝午）
const period = ref(9); // 默认九运（2024-2043）

// 坐山/朝向：口径切换只改解释，山盘/向盘始终用坐山/朝向
const shan = computed(() =>
  mode.value === '坐山'
    ? selectedDir.value
    : oppositeMountain(selectedDir.value)
);
const xiang = computed(() => oppositeMountain(shan.value));
const pan = computed(() => buildPan(shan.value, xiang.value, period.value));
const judges = computed(() => palaceJudges(pan.value, period.value));
const overall = computed(() =>
  overallJudge(pan.value, shan.value, xiang.value, period.value)
);
const overallInfo = computed(() => overallJudgments[overall.value]);
const special = computed(() => specialPositions(pan.value, period.value));
const periodInfo = computed(() => {
  const p = yunPeriods.find((x) => x.period === period.value);
  return p ? `${p.yuan}${period.value}运（${p.start}-${p.end}）` : '';
});
</script>

<style scoped>
.fs-view {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.fs-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--gold);
  background: var(--scroll);
}
.fs-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 24px;
  color: var(--deep-ink);
  margin: 0;
  letter-spacing: 0.1em;
}
.fs-close {
  width: 40px;
  height: 40px;
  font-size: 26px;
  line-height: 1;
  color: var(--ink-light);
  background: none;
  border: none;
  border-radius: 50%;
}
.fs-close:hover {
  color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.08);
}
.fs-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 48px;
}
.fs-luopan {
  width: min(70vw, 380px);
  margin: 0 auto 10px;
}
.fs-controls {
  text-align: center;
  margin-bottom: 14px;
}
.mode-toggle {
  display: inline-flex;
  border: 1px solid var(--gold);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}
.mode-toggle button {
  padding: 7px 22px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: none;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.mode-toggle button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.period-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.period-btn {
  width: 34px;
  height: 34px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.period-btn.active {
  background: var(--gold);
  color: #faf3e8;
}
.period-range {
  font-size: 12px;
  color: var(--ink-light);
  margin: 0 0 10px;
}
.readout {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--cinnabar);
  margin: 0 0 8px;
}
.overall-banner {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0 auto;
  max-width: 520px;
  padding: 8px 14px;
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  background: var(--scroll);
}
.fs-pan {
  margin: 6px 0 18px;
}
.fs-reading {
  max-width: 560px;
  margin: 0 auto;
}
.fs-reading h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.advice {
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
  margin: 0;
}
.palace-list,
.special-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.palace-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  padding: 6px 0;
  border-bottom: 1px dotted var(--gold-light);
}
.palace-tag {
  flex: none;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 18px;
  color: var(--cinnabar);
}
.lvl {
  flex: none;
  font-size: 12px;
  letter-spacing: 0.05em;
  width: 28px;
  text-align: center;
}
.lv-旺 {
  color: var(--cinnabar);
}
.lv-吉 {
  color: var(--gold);
}
.lv-凶,
.lv-煞 {
  color: var(--ink-light);
}
.lv-平 {
  color: var(--ink-light);
}
.brief {
  flex: 1;
}
.special-list li {
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink);
  padding: 6px 0;
}
.fs-disclaimer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--ink-light);
}

@media (min-width: 820px) {
  .fs-body {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 20px;
    align-items: start;
  }
  .fs-luopan {
    grid-row: 1 / 3;
    margin: 0;
  }
  .fs-pan {
    margin: 0;
  }
}
</style>
