<template>
  <div class="poster-page" :class="`state-${state}`">
    <div class="poster">
      <div class="rod rod-top" />

      <div class="frame">
        <span class="corner corner-tl" /><span class="corner corner-tr" />
        <span class="corner corner-bl" /><span class="corner corner-br" />

        <header class="poster-header">
          <h1 class="title">周易</h1>
          <p class="subtitle">六十四卦方圆图 · 伏羲</p>
          <span class="seal">易</span>
        </header>

        <div class="chart-wrap">
          <HexagramSquareCircle
            :selected="selectedHexagram?.name || ''"
            :cast-name="divinationResult?.name || ''"
            :casting="state === 'casting'"
            @hover="hoverName = $event"
            @select="onSelect"
          />
        </div>

        <div class="info-bar">
          <template v-if="info">
            <span class="info-name">{{ info.name }}</span>
            <span class="info-text">{{ info.plain }}</span>
          </template>
          <span v-else class="info-hint">悬停或点击卦象查看释义 · 静心起卦得卦</span>
        </div>

        <footer class="poster-footer">
          <div class="direction-row">
            <label for="cast-direction">所问何事</label>
            <select id="cast-direction" v-model="selectedDirection">
              <option value="">无方向（开放问题）</option>
              <option>事业</option>
              <option>情感</option>
              <option>健康</option>
              <option>学业</option>
              <option>财富</option>
              <option>家庭</option>
              <option value="其他">其他</option>
            </select>
            <input
              v-if="selectedDirection === '其他'"
              v-model="customDirection"
              type="text"
              placeholder="请输入所问之事"
              class="direction-input"
            />
          </div>
          <button class="cast-btn" type="button" :disabled="state !== 'idle'" @click="drawHexagram">静 心 起 卦</button>
          <p class="colophon">邵雍《皇极经世》· 六十四卦方位</p>
        </footer>
      </div>

      <div class="rod rod-bottom" />
    </div>

    <HexagramDetailPanel v-if="selectedHexagram" />
    <ResultScroll v-if="state === 'reading'" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HexagramSquareCircle from '../components/chart/HexagramSquareCircle.vue'
import HexagramDetailPanel from '../components/compass/HexagramDetailPanel.vue'
import ResultScroll from '../components/scroll/ResultScroll.vue'
import { useCompass } from '../composables/useCompass'
import { hexagrams } from '../data/hexagrams'

const {
  state,
  selectedHexagram,
  divinationResult,
  selectedDirection,
  customDirection,
  drawHexagram,
  selectHexagram,
  clearSelection,
} = useCompass()

const hoverName = ref('')

// 注释条显示：优先悬停卦，其次选中卦
const info = computed(() => {
  const name = hoverName.value || selectedHexagram.value?.name || ''
  return hexagrams.find(h => h.name === name) || null
})

function onSelect(name) {
  const h = hexagrams.find(x => x.name === name)
  if (!h) return
  if (selectedHexagram.value?.name === name) clearSelection()
  else selectHexagram(h)
}
</script>

<style scoped>
.poster-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  position: relative;
  overflow: hidden;
  background:
    /* 回纹底纹：四边回字格平铺 */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cg fill='none' stroke='%232c2416' stroke-opacity='0.12' stroke-width='1.3'%3E%3Crect x='3' y='3' width='38' height='38'/%3E%3Crect x='14' y='14' width='16' height='16'/%3E%3C/g%3E%3C/svg%3E") repeat,
    /* 墨晕 */
    radial-gradient(140% 100% at 12% 8%, rgba(255, 252, 242, 0.95) 0%, transparent 55%),
    radial-gradient(120% 90% at 88% 92%, rgba(178, 58, 46, 0.11) 0%, transparent 55%),
    radial-gradient(90% 80% at 82% 10%, rgba(44, 36, 22, 0.09) 0%, transparent 62%),
    radial-gradient(70% 70% at 6% 90%, rgba(168, 135, 58, 0.10) 0%, transparent 55%),
    linear-gradient(180deg, #f9f4ea 0%, #efe7d6 100%);
}
/* 菱格编织纹理：斜向交叉细纹，清晰的宣纸编织底纹 */
.poster-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.85;
  background-image:
    repeating-linear-gradient(45deg, rgba(44, 36, 22, 0.05) 0 1.5px, transparent 1.5px 22px),
    repeating-linear-gradient(-45deg, rgba(44, 36, 22, 0.05) 0 1.5px, transparent 1.5px 22px);
}

/* —— 挂轴 —— */
.poster {
  position: relative;
  width: min(94vw, 860px);
}
.rod {
  height: 16px;
  margin: 0 -14px;
  border-radius: 5px;
  background: linear-gradient(to bottom, #54422e, #2c2214 45%, #3b2d1d 80%, #1f180e);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
.rod-top { margin-bottom: -2px; }
.rod-bottom { margin-top: -2px; }

/* —— 画框 —— */
.frame {
  position: relative;
  background:
    /* 画框内底纹：浅回纹平铺 */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cg fill='none' stroke='%23604830' stroke-opacity='0.10' stroke-width='1.2'%3E%3Crect x='2.5' y='2.5' width='31' height='31'/%3E%3Crect x='12' y='12' width='12' height='12'/%3E%3C/g%3E%3C/svg%3E") repeat,
    linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 32%),
    var(--scroll);
  border: 2px solid var(--gold);
  box-shadow: 0 12px 44px rgba(44, 36, 22, 0.22);
  padding: 6px 30px 24px;
}
.corner {
  position: absolute;
  width: 34px;
  height: 34px;
  border: 2px solid var(--gold);
  z-index: 2;
}
.corner-tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
.corner-tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
.corner-bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
.corner-br { bottom: -2px; right: -2px; border-left: none; border-top: none; }

/* —— 标题区 —— */
.poster-header {
  position: relative;
  text-align: center;
  padding: 24px 0 6px;
}
.title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 54px;
  margin: 0;
  color: var(--deep-ink);
  letter-spacing: 0.18em;
  text-indent: 0.18em;
}
.subtitle {
  font-size: 13px;
  color: var(--ink-light);
  letter-spacing: 0.42em;
  margin: 4px 0 0;
}
.seal {
  position: absolute;
  top: 18px;
  right: 10px;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cinnabar);
  color: #faf3e8;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 28px;
  border-radius: 4px;
  transform: rotate(4deg);
  box-shadow: 0 2px 8px rgba(178, 58, 46, 0.45);
}

/* —— 卦图 —— */
.chart-wrap {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}
.chart-wrap :deep(svg) {
  width: min(78vw, 560px);
  height: auto;
  display: block;
}

/* —— 注释条 —— */
.info-bar {
  max-width: 560px;
  min-height: 54px;
  margin: 10px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 10px 18px;
  border-top: 1px solid var(--gold-light);
  border-bottom: 1px solid var(--gold-light);
  text-align: center;
}
.info-name {
  flex: none;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--cinnabar);
}
.info-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.info-hint {
  font-size: 13px;
  letter-spacing: 0.18em;
  color: var(--ink-light);
}

/* —— 方向选择与起卦 —— */
.poster-footer {
  text-align: center;
  padding: 16px 0 8px;
}
.direction-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--ink-light);
  margin-bottom: 14px;
}
.direction-row select,
.direction-input {
  padding: 7px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--gold);
  border-radius: 4px;
  background: #fffdf6;
  color: var(--ink);
}
.direction-input { width: 180px; }
.cast-btn {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 20px;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  padding: 12px 46px;
  color: #faf3e8;
  background: var(--cinnabar);
  border: none;
  border-radius: 5px;
  box-shadow: 0 4px 16px rgba(178, 58, 46, 0.4);
  transition: transform 0.15s, box-shadow 0.2s;
}
.cast-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 22px rgba(178, 58, 46, 0.5);
}
.cast-btn:disabled {
  opacity: 0.5;
  cursor: default;
  transform: none;
  box-shadow: none;
}
.colophon {
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--ink-light);
  margin: 14px 0 0;
}

/* —— 阅读态：挂图退后 —— */
.poster-page.state-reading .poster {
  filter: blur(2px) brightness(0.92);
  transition: filter 0.4s;
}

@media (max-width: 600px) {
  .poster-page { padding: 16px 10px; }
  .frame { padding: 4px 14px 18px; }
  .title { font-size: 38px; }
  .seal { width: 36px; height: 36px; font-size: 21px; right: 4px; top: 14px; }
  .chart-wrap :deep(svg) { width: 88vw; }
  .info-bar { min-height: 46px; gap: 8px; padding: 8px 10px; }
  .info-name { font-size: 22px; }
}
</style>
