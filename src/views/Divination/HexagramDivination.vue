<template>
  <div class="hexagram-divination mystic-bg">
    <!-- 神秘学装饰 SVG 背景（如悬浮太极与八卦） -->
    <svg class="yijing-bg-top" width="180" height="180" viewBox="0 0 180 180" fill="none">
      <g>
        <circle cx="90" cy="90" r="89" stroke="url(#goldEdge)" stroke-width="2" fill="url(#deepBlue)"/>
        <!-- 八卦符号（简化版） -->
        <g>
          <!-- 八卦符号：八个方位，每方位一组三爻线，严格对应八卦爻码 -->
          <!-- 实线：一整条，阴爻（断线）：两短中断 -->
          <!-- 乾 ☰ 111 -->
          <g transform="rotate(0 90 90)">
            <rect x="76" y="12" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 兑 ☱ 110 -->
          <g transform="rotate(45 90 90)">
            <rect x="76" y="12" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <!-- 阴爻（断线）下：两短 -->
            <rect x="76" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 离 ☲ 101 -->
          <g transform="rotate(90 90 90)">
            <rect x="76" y="12" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <!-- 阴爻中：两短 -->
            <rect x="76" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 震 ☳ 100 -->
          <g transform="rotate(135 90 90)">
            <rect x="76" y="12" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <!-- 阴爻中、下：两短 -->
            <rect x="76" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 巽 ☴ 011 -->
          <g transform="rotate(180 90 90)">
            <!-- 阴爻上：两短 -->
            <rect x="76" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 坎 ☵ 010 -->
          <g transform="rotate(225 90 90)">
            <!-- 阴爻上、下：两短 -->
            <rect x="76" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 艮 ☶ 001 -->
          <g transform="rotate(270 90 90)">
            <!-- 阴爻上、中：两短 -->
            <rect x="76" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="28" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
          <!-- 坤 ☷ 000 -->
          <g transform="rotate(315 90 90)">
            <!-- 阴爻三条：三层两短 -->
            <rect x="76" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="12" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="17" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="76" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
            <rect x="94" y="22" width="10" height="3" rx="1.5" fill="url(#goldEdge)" opacity="0.8"/>
          </g>
        </g>
        <!-- 太极 -->
        <g>
          <TaijiSymbol
            :centerX="90"
            :centerY="90"
            :radius="30"
            strokeColor="none"
            clipId="taiji-hexagram-bg"
          />
        </g>
        <defs>
          <radialGradient id="deepBlue" cx="0.5" cy="0.5" r="0.7">
            <stop stop-color="#181a32" />
            <stop offset="1" stop-color="#2d2252" />
          </radialGradient>
          <linearGradient id="goldEdge" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop stop-color="#e7cb92"/>
            <stop offset="1" stop-color="#af8f34"/>
          </linearGradient>
          <radialGradient id="taiji" cx="0.5" cy="0.5" r="0.5">
            <stop stop-color="#FFF" />
            <stop offset="0.6" stop-color="#d1ceb7" />
            <stop offset="1" stop-color="#0A1931" />
          </radialGradient>
        </defs>
      </g>
    </svg>
    <!-- 顶部标题 -->
    <h2 class="title-mystic">六爻占卜</h2>
    
    <div class="input-area glassy-card">
      <div class="direction-select">
        <label for="direction">问题方向（可选）：</label>
        <select id="direction" v-model="selectedDirection">
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
          class="custom-direction-input"
        />
      </div>
      <button @click="generateNewHexagram" class="btn-golden">随机生成卦象</button>
    </div>

    <div v-if="hexagram" class="result-area aura-fadein">
      <!-- 卦图部分 -->
      <div class="section-card">
        <h3 class="section-title">卦象图</h3>
        <div class="hexagram-svg">
          <HexagramChart
            :highlightBinary="hexagram && Array.isArray(hexagram)
              ? hexagram.map(x => x === 1 ? '1' : '0').join('')
              : ''"
          />
        </div>
      </div>

      <!-- 权威解读 -->
      <div class="section-card">
        <h3 class="section-title">卦象权威解读</h3>
        <HexagramDescription
          :x="120"
          :y="40"
          :width="220"
          :height="70"
          :title="hexagramName"
          :content="hexagramText"
          :direction="direction"
        />
      </div>

      <div class="section-card">
        <h3 class="section-title">爻辞</h3>
        <div class="line-texts">
          <ul>
            <li v-for="(text, index) in lineTexts" :key="index">
              {{ text }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="section-card">
        <h3 class="section-title">白话解读</h3>
        <div class="colloquial-text">{{ colloquialText }}</div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { generateHexagram, getHexagramName, getHexagramText, getLineTexts } from '@/utils/divination';

import HexagramDescription from '@/components/hexagram/HexagramDescription.vue';
import HexagramChart from '@/components/HexagramChart.vue';
import TaijiSymbol from '@/components/hexagram/TaijiSymbol.vue';
import HexagramSymbol from '@/components/hexagram/HexagramSymbol.vue';
import type { Hexagram } from '@/data/hexagrams';

// 方向相关
const selectedDirection = ref<string>('');
const customDirection = ref<string>('');
const direction = computed(() => {
  if (selectedDirection.value === '其他') {
    return customDirection.value.trim();
  }
  return selectedDirection.value;
});

const YaoSymbols = {
  Yang: '——',
  Yin: '-- --',
};

const hexagram = ref<number[] | null>(null);
const hexagramName = ref<string>('');
const hexagramText = ref<string>('');
const lineTexts = ref<string[]>([]);
const hexagrams = reactive<Hexagram[]>([]);

const colloquialText = computed(() => {
  // 简易白话解读示例，后续可根据卦名等联动数据库或更智能AI
  if (!hexagramName.value) return '——';
  return `此卦${hexagramName.value}，主旨为：${hexagramText.value ? hexagramText.value.replace(/，|。/g, '，') : "..."}。结合当前方向，更需注意内外变化、顺应时势，积极应对问题。`;
});

const generateNewHexagram = () => {
  const newHexagram = generateHexagram();
  hexagram.value = newHexagram;
  hexagramName.value = getHexagramName(newHexagram);
  hexagramText.value = getHexagramText(hexagramName.value);
  lineTexts.value = getLineTexts(newHexagram);
  // direction.value 可用于后续解卦分析
  // console.log('当前问题方向：', direction.value);
};

const fetchHexagrams = async () => {
  const { hexagrams: fetchedHexagrams } = await import('@/data/hexagrams.js');
  hexagrams.push(...fetchedHexagrams);
};

onMounted(() => {
  fetchHexagrams();
});
</script>

<style scoped>
.hexagram-divination {
  max-width: 870px;
  margin: 36px auto 30px auto;
  padding: 38px 24px 48px 24px;
  background: linear-gradient(130deg, #181a32 85%, #43387a 96%);
  border-radius: 24px;
  box-shadow: 0 6px 42px 0 #00000099;
  color: #e5dcbe;
  font-family: 'Cinzel', '思源宋体', serif;
  position: relative;
  overflow: hidden;
  z-index: 0;
  letter-spacing: 0.08em;
}

.result-area {
  display: grid;
  gap: 26px;
}

.section-card {
  background: rgba(255,255,255,0.06);
  border-radius: 14px;
  box-shadow: 0 3px 24px #ede9c114 inset;
  border: 1.7px solid #ebdcbd24;
  margin-bottom: 0.2em;
  padding: 18px 9px 14px 18px;
}

.hexagram-svg {
  display: block;
  margin: 0 auto 0 auto;
  background: none;
}

.colloquial-text {
  font-size: 1.07rem;
  color: #fff5dc;
  letter-spacing: 0.05em;
  line-height: 1.7;
  background: rgba(60,54,39,0.11);
  border-radius: 8px;
  padding: 16px 10px 12px 13px;
  box-shadow: 0 0 6px #e7cb923e inset,0 1px 8px #fff1 inset;
  text-shadow: 0 1px 2px #0005;
  font-family: "Source Han Serif SC", "思源宋体", serif;
}

.mystic-bg:before {
  content: "";
  position: absolute;
  left: -150px;
  top: -110px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(180,160, 80,0.16) 0%, transparent 76%);
  filter: blur(4px);
  z-index: 0;
  pointer-events: none;
}
.yijing-bg-top {
  position: absolute;
  left: -38px;
  top: -62px;
  opacity: 0.60;
  z-index: 1;
  pointer-events: none;
}
.title-mystic {
  text-align: center;
  font-size: 2.38rem;
  font-family: 'Cinzel', '思源宋体', serif;
  letter-spacing: 0.2em;
  font-weight: 700;
  color: #eacd91;
  text-shadow:
    0 0 7px #b8861b88,
    0 1px 18px #d2c85a66,
    0 0 2px #fff5;
  position: relative;
  margin-bottom: 32px;
  background: linear-gradient(90deg, #fff6c7 50%, #bc9100 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.input-area {
  margin-bottom: 28px;
  text-align: center;
  width: 95%;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2;
}

.glassy-card {
  background: rgba(36,36,44,0.65);
  border-radius: 1.2em;
  border: 1.5px solid #ab895f5d;
  box-shadow: 0 2px 24px 0 #2d225255, 0 1px 24px #e5dec92b inset;
  backdrop-filter: blur(3.5px);
  padding: 22px 10px 24px 10px;
  margin-bottom: 30px;
}

.direction-select {
  margin-bottom: 14px;
  text-align: center;
}

.direction-select label {
  margin-right: 8px;
  font-size: 1.11rem;
  color: #eacce5;
  letter-spacing: 0.14em;
}

.direction-select select,
.custom-direction-input {
  padding: 8px 19px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1.5px solid #a38a44;
  margin-right: 10px;
  margin-top: 4px;
  background: rgba(22,22,30,0.98);
  color: #ffeebb;
  box-shadow: 0 0 6px #a38a4486;
  transition: border 0.2s, box-shadow 0.2s;
}
.custom-direction-input {
  width: 186px;
}

.direction-select select:focus,
.custom-direction-input:focus {
  outline: none;
  border: 1.5px solid #e0b343;
  box-shadow: 0 2px 8px #e7cb9277;
}

.btn-golden {
  padding: 11px 42px;
  font-size: 1.16rem;
  border: none;
  border-radius: 6px;
  background: linear-gradient(90deg, #e3c86a 0%, #c49d3b 89%);
  color: #3a2121;
  font-weight: 600;
  box-shadow: 0 2px 14px #c2ae5a66, 0 0 2px #fff9;
  cursor: pointer;
  transition: background 0.23s, box-shadow 0.19s, transform 0.13s;
  letter-spacing: 0.11em;
}
.btn-golden:hover {
  background: linear-gradient(90deg,#fcf1b3 17%, #ffda7a 97%);
  box-shadow: 0 8px 28px 0px #bd9e3980, 0 0 16px #ffe;
  transform: scale(1.045);
}

.result-area {
  background: linear-gradient(120deg, #271c42da 55%, #3b3559f1 96%);
  border-radius: 20px;
  margin: 19px auto 0 auto;
  padding: 33px 12px 29px 12px;
  box-shadow:
    0 6px 32px #2c192a44,
    0 1px 82px #beaf5e33 inset;
  max-width: 700px;
  border: 1.3px solid #bcab6e48;
  position: relative;
  z-index: 2;
  animation: fadein-result 1.15s;
}
.aura-fadein {
  animation: auraFadeinShadow 2.1s;
}
@keyframes auraFadeinShadow {
  0% { box-shadow: 0 0 0 #0000;}
  70% { box-shadow: 0 16px 44px 0 #d7c87e44;}
  100% { box-shadow:
      0 6px 32px #2c192a44,
      0 1px 82px #beaf5e33 inset;}
}

.section-title {
  font-family: 'Cinzel', '思源宋体', serif;
  font-size: 1.28rem;
  color: #ffeca0;
  letter-spacing: 0.15em;
  text-shadow: 0 1px 4px #e7cb921f;
  margin-bottom: 18px;
  font-weight: 700;
}

.hexagram-display {
  margin: 22px 0 7px 0;
  text-align: center;
  font-size: 31px;
  color: #ffd700;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  box-shadow: 0 1px 10px #e5ae3f14 inset;
  padding: 17px 6px;
  border: 1px solid #ad98461c;
}

.line {
  margin: 8px 0;
  font-size: 27px;
  letter-spacing: 0.24em;
  text-shadow: 0 0 8px #ab8954cc;
  color: #fde5a4;
  min-height: 30px;
  font-family: 'Cinzel', '思源宋体', serif;
}

.hexagram-info {
  text-align: left;
  background: rgba(255, 255, 255, 0.097);
  padding: 19px 16px 10px 16px;
  border-radius: 12px;
  border: 1px solid #fff3;
  margin-bottom: 7px;
  box-shadow: 0 0 10px #fff3 inset, 0 1px 23px #9b8d4a17;
  color: #efecd9;
  font-size: 1.04rem;
}

.line-texts ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.line-texts li {
  margin: 12px 0 9px 0;
  color: #fff2cd;
  font-size: 1.03rem;
  letter-spacing: 0.09em;
  text-shadow: 0 0 5px #bda35d44;
  border-bottom: 1px dashed #e0c39122;
  padding-bottom: 3px;
}

.hexagram-gallery {
  margin-top: 44px;
  text-align: center;
  /* 可后续加入更多装饰或优化 */
}

.direction-select {
  margin-bottom: 12px;
}

.direction-select label {
  margin-right: 8px;
  font-size: 16px;
}

.direction-select select,
.custom-direction-input {
  padding: 6px 12px;
  font-size: 15px;
  border-radius: 4px;
  border: 1px solid #888;
  margin-right: 8px;
  margin-top: 4px;
}

.custom-direction-input {
  width: 180px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #3e3e50;
  color: #f5f5f5;
  border: none;
  border-radius: 5px;
  transition: all 0.3s ease;
}

button:hover {
  background: #5a5a75;
  transform: scale(1.05);
}

.hexagram-display {
  margin: 20px 0;
  text-align: center;
  font-size: 28px;
  color: #ffd700;
}

.line {
  margin: 5px 0;
  font-size: 24px;
}

.hexagram-info {
  text-align: left;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
}

.line-texts ul {
  list-style: none;
  padding: 0;
}

.line-texts li {
  margin: 10px 0;
  color: #dcdcdc;
}

.hexagram-gallery {
  margin-top: 40px;
  text-align: center;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  justify-items: center;
}

.gallery-item {
  position: relative;
  text-align: center;
  background: linear-gradient(135deg, #2a2a3b, #1e1e2f);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.gallery-item:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.hexagram-name {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8px;
}

.hexagram-lines .line {
  font-size: 22px;
  color: #f5f5f5;
}

.gallery-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  pointer-events: none;
}
</style>