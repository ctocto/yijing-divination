<template>
  <div class="pan-grid">
    <div
      v-for="j in judges"
      :key="j.palace"
      class="pan-cell"
      :class="[`lv-${j.level}`, { center: j.palace === '中' }]"
    >
      <span class="badges">{{ badgesOf(j.palace) }}</span>
      <div class="cell-stars">
        <span class="star yun">{{ j.yun }}</span>
        <span class="star shan">{{ j.shan }}</span>
        <span class="star xiang">{{ j.xiang }}</span>
      </div>
      <div class="cell-level">{{ j.level }}</div>
      <div class="cell-palace">{{ palaceLabel(j.palace) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PALACE_NUM } from '@/utils/fengShui';

const props = defineProps({
  judges: { type: Array, default: () => [] },
  special: { type: Object, default: () => ({}) },
});

// 宫位 → 方位标注
const DIR = {
  坎: '北',
  艮: '东北',
  震: '东',
  巽: '东南',
  离: '南',
  坤: '西南',
  兑: '西',
  乾: '西北',
  中: '中',
};
const palaceLabel = (p) => `${DIR[p]}·${PALACE_NUM[p]}`;

function badgesOf(palace) {
  const out = [];
  if (props.special.cai === palace) out.push('财');
  if (props.special.wen === palace) out.push('文');
  if (props.special.bing === palace) out.push('病');
  if (props.special.sha === palace) out.push('煞');
  return out.join(' ');
}
</script>

<style scoped>
.pan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: min(78vw, 420px);
  aspect-ratio: 1;
  margin: 0 auto;
}
.pan-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  background: var(--scroll);
  min-height: 0;
}
.cell-stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.star {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  color: var(--scroll);
  border: 1px solid rgba(250, 243, 232, 0.4); /* 深色底（煞）上仍可见 */
}
.star.yun {
  background: var(--gold);
}
.star.shan {
  background: var(--ink-light);
}
.star.xiang {
  background: var(--ink);
}
.cell-level {
  font-size: 12px;
  letter-spacing: 0.1em;
}
.cell-palace {
  font-size: 11px;
  color: var(--ink-light);
}

.lv-旺 {
  background: #f6e3df;
}
.lv-旺 .cell-level {
  color: var(--cinnabar);
}
.lv-吉 {
  background: #faf3e0;
}
.lv-吉 .cell-level {
  color: var(--gold);
}
.lv-凶 {
  background: #ece7dc;
}
.lv-凶 .cell-level {
  color: var(--ink-light);
}
.lv-煞 {
  background: #2c2416;
}
.lv-煞 .star,
.lv-煞 .cell-level {
  color: #faf3e8;
}
.lv-煞 .cell-palace {
  color: rgba(250, 243, 232, 0.7);
}
.lv-平 {
  background: var(--scroll);
}
.lv-平 .cell-level {
  color: var(--ink-light);
}

.badges {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 11px;
  color: var(--cinnabar);
  letter-spacing: 0.05em;
}
.pan-cell.center .cell-palace {
  display: none;
}
</style>
