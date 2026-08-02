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
        <Luopan
          :mountain="selectedDir"
          :mode="luopanMode"
          :fine-angle="luopanMode === 'ding' ? fineAngle : null"
          @select="selectedDir = $event"
          @readout="readout = $event"
        />
      </section>

      <section class="fs-controls">
        <div class="mode-switch" role="group" aria-label="罗盘模式">
          <button
            v-for="m in MODES"
            :key="m.id"
            type="button"
            :class="{ active: luopanMode === m.id }"
            @click="luopanMode = m.id"
          >
            {{ m.label }}
          </button>
        </div>
        <template v-if="luopanMode === 'ding'">
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
        </template>

        <div v-if="compassSupported" class="compass-row">
          <button
            type="button"
            class="compass-btn"
            :disabled="compassState === 'running'"
            @click="startCompass"
          >
            🧭 手机朝向对准
          </button>
          <template v-if="compassState === 'running'">
            <span class="compass-live">
              {{
                compassHeading === null
                  ? '转动手机获取方向…'
                  : `当前指向 ${liveName}（${Math.round(compassHeading)}°）`
              }}
            </span>
            <span class="level-hint" :class="{ ok: isLevel }">{{
              isLevel ? '已水平' : '请放平'
            }}</span>
            <button
              type="button"
              class="compass-btn"
              :disabled="compassHeading === null"
              @click="lockCompass"
            >
              锁定
            </button>
            <button type="button" class="compass-btn ghost" @click="stopSensor">
              取消
            </button>
          </template>
        </div>
        <p v-if="compassState === 'denied'" class="compass-hint">
          未获方向传感器权限，请在浏览器或系统设置中允许访问后重试
        </p>

        <p class="readout">
          <template v-if="luopanMode === 'ding'"
            >坐{{ shan }}·{{ fenjin?.shan.name ?? '骑缝' }}({{
              fenjin?.shan.level ?? '–'
            }}) 朝{{ xiang }}·{{ fenjin?.xiang.name ?? '骑缝' }}({{
              fenjin?.xiang.level ?? '–'
            }})</template
          >
          <template v-else-if="luopanMode === 'xiao'"
            >人盘 {{ readout?.human ?? '–' }} · 宿
            {{ readout?.mansion ?? '–' }}</template
          >
          <template v-else-if="luopanMode === 'na'"
            >天盘 {{ readout?.heaven ?? '–' }} ·
            {{ readout?.degree ?? '–' }}°</template
          >
          <template v-else-if="luopanMode === 'ze'"
            >{{ readout?.term ?? '–' }} · {{ readout?.jiazi ?? '–' }}</template
          >
          <template v-else-if="luopanMode === 'gua'"
            >卦 {{ readout?.hexagram ?? '–' }}</template
          >
          <span v-if="luopanMode !== 'ding'" class="readout-deg">
            {{ readout?.degree ?? '' }}°</span
          >
        </p>
        <template v-if="luopanMode === 'ding'">
          <p class="overall-banner">
            <b>{{ overallInfo.name }}</b> —— {{ overallInfo.text }}
          </p>
        </template>
        <p class="readout-detail">
          <template v-if="luopanMode === 'ding'"
            >{{ readout?.degree ?? '–' }}° ·
            {{ readout?.term ?? '–' }}</template
          >
          <template v-else-if="luopanMode === 'gua'"
            >先天圆环 · 坐向卦读数</template
          >
        </p>
      </section>

      <template v-if="luopanMode === 'ding'">
        <section class="fs-pan">
          <FlyingStarPan :judges="judges" :special="special" />
        </section>

        <section class="fs-fenjin">
          <h2>分金吉凶</h2>
          <p class="fj-hint">点按居中即正向·龟甲，拖拽微调至旺相分金</p>
          <template v-if="fenjin">
            <p class="fj-row">
              坐分金：<b>{{ fenjin.shan.name }}</b
              >（{{ fenjin.shan.nian || '—' }}）·
              <span
                class="fj-level"
                :class="fenjin.shan.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                >{{ fenjin.shan.level }}</span
              >
              · {{ fenjin.shan.ji }}
            </p>
            <p class="fj-text">{{ fenjin.shan.text }}</p>
            <p class="fj-row">
              向分金：<b>{{ fenjin.xiang.name }}</b
              >（{{ fenjin.xiang.nian || '—' }}）·
              <span
                class="fj-level"
                :class="fenjin.xiang.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                >{{ fenjin.xiang.level }}</span
              >
              · {{ fenjin.xiang.ji }}
            </p>
            <p class="fj-text">{{ fenjin.xiang.text }}</p>
          </template>
          <p class="fs-disclaimer">一百二十分金 · 文化参考</p>
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
      </template>

      <template v-else-if="luopanMode === 'xiao'">
        <section class="fs-sha">
          <h2>消砂判断</h2>
          <p class="sha-shan">
            坐山 {{ selectedDir }}（{{ shanSheng }}） · 线度五行 {{ shanLine }}
          </p>
          <p v-if="baShaInfo" class="sha-basha">
            ⚠ 八煞：{{ baShaInfo.branch }}方（{{ baShaInfo.angle }}°）逢砂须忌
          </p>
          <table class="sha-table">
            <thead>
              <tr>
                <th>方位</th>
                <th>砂宿·五行</th>
                <th>砂名</th>
                <th>吉凶</th>
                <th>应房</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in shaRows"
                :key="s.deg"
                :class="{ current: s.deg === currentDir }"
              >
                <td>{{ s.dir }}</td>
                <td>{{ s.mansion }}·{{ s.shaWx }}</td>
                <td>{{ s.name }}</td>
                <td class="lvl" :class="`lv-${s.level}`">{{ s.level }}</td>
                <td class="sha-fang">
                  <span v-for="f in s.fang" :key="f.name"
                    >{{ f.name }}·{{ f.fang.join('/') }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="currentSha" class="sha-detail">
            {{ currentSha.dir }}·{{ currentSha.name }}：{{ currentSha.text }}
          </p>
          <p class="fs-disclaimer">赖公砂法 · 文化参考</p>
        </section>
      </template>

      <template v-else-if="luopanMode === 'na'">
        <section class="fs-shui">
          <h2>纳水判断</h2>
          <p class="shui-shan">
            坐山 {{ selectedDir }} → {{ shuiJu.ju }}局（长生
            {{ shuiJu.changshengName }}）
          </p>
          <div class="flow-switch" role="group" aria-label="水流方向">
            <button
              type="button"
              :class="{ active: flow === 'left' }"
              @click="flow = 'left'"
            >
              左水倒右
            </button>
            <button
              type="button"
              :class="{ active: flow === 'right' }"
              @click="flow = 'right'"
            >
              右水倒左
            </button>
          </div>
          <div class="shui-lock">
            <button type="button" @click="inAngle = readout?.angle ?? null">
              锁定来水
            </button>
            <button type="button" @click="outAngle = readout?.angle ?? null">
              锁定去水
            </button>
            <span v-if="inAngle !== null" class="shui-locked"
              >来水 {{ inAngle }}°</span
            >
            <span v-if="outAngle !== null" class="shui-locked"
              >去水 {{ outAngle }}°</span
            >
          </div>
          <template v-if="shuiInfo">
            <p class="shui-pos">
              来水 <b>{{ shuiInfo.inPos }}</b
              >（{{ shuiInfo.inLai }}）· {{ shuiInfo.inText }}
            </p>
            <p class="shui-pos">
              去水 <b>{{ shuiInfo.outPos }}</b
              >（{{ shuiInfo.outQu }}）· {{ shuiInfo.outText }}
            </p>
            <p class="shui-summary">{{ shuiInfo.summary }}</p>
          </template>
          <p v-else class="shui-hint">请先锁定来水与去水方位</p>
          <p class="fs-disclaimer">三合水法 · 文化参考</p>
        </section>
      </template>

      <template v-else-if="luopanMode === 'gua'">
        <section class="fs-yijing">
          <h2>抽爻换象</h2>
          <p class="yi-ben">
            本卦 <b>{{ benGuaName }}</b>
          </p>
          <div class="yi-lines" role="group" aria-label="六爻抽动">
            <button
              v-for="i in 6"
              :key="i - 1"
              type="button"
              class="yi-line"
              :class="{ active: movingYao === i - 1 }"
              :aria-pressed="movingYao === i - 1"
              @click="movingYao = i - 1"
            >
              {{ yaoLines[i - 1] }}
            </button>
          </div>
          <p class="yi-hint">点选一爻为动爻</p>
          <template v-if="chouYao">
            <p class="yi-line-text">
              动爻 <b>{{ chouYao.line }}</b>
            </p>
            <p class="yi-bian">
              变卦 <b>{{ chouYao.bian }}</b> —— {{ chouYao.bianText }}（{{
                chouYao.bianPlain
              }}）
            </p>
          </template>
          <p v-else class="yi-none">选一爻看变卦</p>
          <p class="fs-disclaimer">六十四卦抽爻 · 文化参考</p>
        </section>
      </template>

      <template v-else-if="luopanMode === 'ze'">
        <section class="fs-zeri">
          <h2>择日判断</h2>
          <p class="zeri-head">
            {{ readout?.term ?? '–' }} · {{ readout?.jiazi ?? '–' }}（{{
              zeriInfo?.nian ?? '–'
            }}）
          </p>
          <p class="zeri-main">
            {{ zeriInfo?.monthB ?? '–' }}月 · {{ zeriInfo?.dayB ?? '–' }}日 ·
            <b>{{ zeriInfo?.jianChu?.name ?? '–' }}</b
            >日（{{ zeriInfo?.huangDao?.name ?? '–' }} ·
            {{ zeriInfo?.huangDao?.dao ?? '–' }}道）
          </p>
          <p class="zeri-text">{{ zeriInfo?.jianChu?.text ?? '' }}</p>
          <p class="fs-disclaimer">建除十二神 · 文化参考</p>
        </section>
      </template>

      <section v-else class="fs-pending">
        <h2>判断区</h2>
        <p class="pending-text">
          {{ pendingText }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import Luopan from './Luopan.vue';
import { MODES } from '@/data/luopanRings';
import FlyingStarPan from './FlyingStarPan.vue';
import { yunPeriods, mountains } from '@/data/luopan';
import { judgeJu, judgeShui } from '@/utils/shui';
import {
  judgeAllSha,
  lineWuxingAt,
  mansionShengAt,
  baShaAt,
} from '@/utils/sha';
import { hexagrams } from '@/data/hexagrams';
import { judgeChouYao } from '@/utils/yijing';
import { judgeZeri } from '@/utils/zeri';
import { judgeFenjin } from '@/utils/fenjin';
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
  mountainAt,
} from '@/utils/fengShui';
import { useCompassSensor } from '@/composables/useCompassSensor';

defineEmits(['close']);

const mode = ref('坐山'); // '坐山' | '朝向'
const selectedDir = ref('子'); // 红针所指 24 山（默认坐子朝午）
const period = ref(9); // 默认九运（2024-2043）
const luopanMode = ref('ding'); // 定向 | 消砂 | 纳水 | 择日 | 易卦
const readout = ref(null); // Luopan 读数

// —— 分金（定向模式立向精度）——
// 十字线实时角度作为分金定位源；传感运行/拖拽/锁定都经 readout.angle 同步
const fineAngle = ref(null);
watch(
  () => readout.value?.angle,
  (a) => {
    if (luopanMode.value === 'ding' && a !== undefined) fineAngle.value = a;
  }
);
// 离开定向模式归位山中心，不污染其他模式
watch(
  () => luopanMode.value,
  (m) => {
    if (m !== 'ding') fineAngle.value = null;
  }
);
// 分金判断：坐 = 十字线角度，向 = +180°
const fenjin = computed(() =>
  readout.value?.angle !== undefined ? judgeFenjin(readout.value.angle) : null
);

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
const overallInfo = computed(
  () => overallJudgments[overall.value] || overallJudgments.ping
);
const special = computed(() => specialPositions(pan.value, period.value));
const periodInfo = computed(() => {
  const p = yunPeriods.find((x) => x.period === period.value);
  return p ? `${p.yuan}${period.value}运（${p.start}-${p.end}）` : '';
});

const pendingText = computed(() => {
  const map = {
    xiao: '消砂判断 · P3 上线（人盘中针 + 二十八宿 · 赖公砂法）',
    na: '纳水判断 · P3 上线（天盘缝针 + 双山五行）',
    ze: '择日输出 · P4 上线（二十四节气 + 六十甲子）',
    gua: '抽爻换象 · P4 上线（先天六十四卦盘）',
  };
  return map[luopanMode.value] || '';
});

// —— 消砂判断 ——
const shanAngle = computed(() => {
  const m = mountains.find((x) => x.name === selectedDir.value);
  return m ? m.angle : 0;
});
// 坐山宿主五行 + 线度五行（读面板用）
const shanSheng = computed(() => mansionShengAt(shanAngle.value));
const shanLine = computed(() => lineWuxingAt(shanAngle.value));
// 八方砂：坐山线度五行为主，八方砂宿主五行为宾
const shaRows = computed(() => judgeAllSha(shanAngle.value));
// 坐山八煞
const baShaInfo = computed(() => baShaAt(shanAngle.value));
// 当前十字线所指方位（吸附 45°）
const currentDir = computed(
  () => (Math.round((readout.value?.angle ?? 0) / 45) * 45) % 360
);
const currentSha = computed(() =>
  shaRows.value.find((s) => s.deg === currentDir.value)
);

// —— 纳水判断 ——
const flow = ref('left'); // 'left' 左水倒右 | 'right' 右水倒左
const inAngle = ref(null); // 锁定来水角度
const outAngle = ref(null); // 锁定去水角度
const shuiJu = computed(() => judgeJu(shanAngle.value));
const shuiInfo = computed(() =>
  inAngle.value !== null && outAngle.value !== null
    ? judgeShui(shanAngle.value, inAngle.value, outAngle.value, flow.value)
    : null
);

// —— 易卦抽爻 ——
const movingYao = ref(null); // 动爻位 0=初爻 … 5=上爻
const benGuaName = computed(() => readout.value?.hexagram ?? '–');
// 卦名 → 本卦 binary（卦名唯一）
const benBinary = computed(
  () => hexagrams.find((h) => h.name === readout.value?.hexagram)?.binary ?? ''
);
// 六爻横条：显示位序 = binary 位序（i=0 初爻在左，i=5 上爻在右），点击索引即显示位序，无错位
const yaoLines = computed(() => {
  if (!benBinary.value) return ['—', '—', '—', '—', '—', '—'];
  return benBinary.value.split('').map((b) => (b === '1' ? '—' : '--'));
});
const chouYao = computed(() =>
  movingYao.value !== null && benBinary.value
    ? judgeChouYao(benBinary.value, movingYao.value)
    : null
);

// —— 择日 ——
const zeriInfo = computed(() =>
  readout.value?.term && readout.value?.jiazi
    ? judgeZeri(readout.value.term, readout.value.jiazi)
    : null
);

// 换坐向卦时清空动爻
watch(
  () => readout.value?.hexagram,
  () => {
    movingYao.value = null;
  }
);

// 手机朝向对准：实时读数预览 + 手动锁定（锁定后写 selectedDir 走既有盘面链路）
const {
  supported: compassSupported,
  state: compassState,
  heading: compassHeading,
  level: isLevel,
  startCompass,
  stopCompass,
} = useCompassSensor();

const liveName = computed(() =>
  compassHeading.value === null ? '' : mountainAt(compassHeading.value)
);

function lockCompass() {
  if (compassHeading.value === null) return;
  selectedDir.value = mountainAt(compassHeading.value);
  stopCompass();
}

function stopSensor() {
  stopCompass();
  fineAngle.value = null; // 取消传感：归位已锁定山中心
}

// 离开页面即停止监听，避免后台耗电
onBeforeUnmount(stopCompass);
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
.mode-switch,
.mode-toggle {
  display: inline-flex;
  border: 1px solid var(--gold);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}
.mode-switch button,
.mode-toggle button {
  padding: 7px 14px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: none;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.mode-toggle button {
  padding: 7px 22px;
}
.mode-switch button.active,
.mode-toggle button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.readout-deg {
  font-size: 13px;
  color: var(--ink-light);
}
.readout-detail {
  font-size: 13px;
  color: var(--gold);
  margin: -4px 0 10px;
}
.fs-pending {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}
.fs-pending h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.pending-text {
  font-size: 14px;
  color: var(--ink-light);
}
.fs-yijing,
.fs-zeri {
  border-top: 1px solid var(--gold);
  padding: 14px 2px;
}
.fs-yijing h2,
.fs-zeri h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.yi-ben {
  font-size: 15px;
  color: var(--deep-ink);
}
.yi-lines {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0 6px;
}
.yi-line {
  width: 44px;
  height: 40px;
  font-size: 20px;
  line-height: 1;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  color: var(--deep-ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  cursor: pointer;
}
.yi-line.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.yi-hint {
  font-size: 12px;
  color: var(--ink-light);
}
.yi-line-text {
  margin-top: 10px;
  font-size: 14px;
}
.yi-bian {
  font-size: 14px;
  color: var(--deep-ink);
  margin-top: 6px;
}
.yi-none {
  color: var(--ink-light);
  font-size: 13px;
  margin-top: 8px;
}
.zeri-head {
  font-size: 14px;
  color: var(--ink-light);
}
.zeri-main {
  font-size: 15px;
  color: var(--deep-ink);
  margin-top: 6px;
}
.zeri-text {
  font-size: 14px;
  margin-top: 6px;
}
.fs-sha {
  max-width: 560px;
  margin: 0 auto;
}
.fs-sha h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.sha-shan {
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 6px;
}
.sha-basha {
  font-size: 13px;
  color: var(--cinnabar);
  margin: 0 0 10px;
}
.sha-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--ink);
  margin: 0 0 10px;
}
.sha-table th,
.sha-table td {
  padding: 6px 8px;
  border-bottom: 1px dotted var(--gold-light);
  text-align: center;
}
.sha-table th {
  color: var(--ink-light);
  font-weight: normal;
  font-size: 12px;
  letter-spacing: 0.1em;
}
.sha-table tr.current {
  background: rgba(178, 58, 46, 0.08);
}
.sha-fang span {
  display: block;
  white-space: nowrap;
}
.sha-fang span + span {
  margin-top: 2px;
}
.sha-detail {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--scroll);
  margin: 0 0 10px;
}
.fs-shui {
  max-width: 560px;
  margin: 0 auto;
}
.fs-shui h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.shui-shan {
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 10px;
}
.flow-switch,
.shui-lock {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 auto 10px;
}
.flow-switch button,
.shui-lock button {
  padding: 7px 14px;
  font-size: 13px;
  color: var(--ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.flow-switch button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.shui-locked {
  font-size: 13px;
  color: var(--cinnabar);
  align-self: center;
}
.shui-pos {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0 0 6px;
}
.shui-pos b {
  color: var(--cinnabar);
}
.shui-summary {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--scroll);
  margin: 0 0 10px;
}
.shui-hint {
  font-size: 13px;
  color: var(--ink-light);
  margin: 0 0 10px;
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
.compass-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 auto 10px;
  max-width: 520px;
}
.compass-btn {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.compass-btn:hover:not(:disabled) {
  background: var(--gold);
  color: #faf3e8;
}
.compass-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.compass-btn.ghost {
  background: none;
  border-style: dashed;
}
.compass-live {
  font-size: 13px;
  color: var(--cinnabar);
}
.level-hint {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--ink-light);
}
.level-hint.ok {
  color: var(--cinnabar);
}
.compass-hint {
  font-size: 12px;
  color: var(--ink-light);
  margin: 0 0 10px;
  text-align: center;
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
.fs-fenjin {
  border-top: 1px solid var(--gold);
  padding: 14px 2px;
}
.fs-fenjin h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.fj-hint {
  font-size: 12px;
  color: var(--ink-light);
}
.fj-row {
  font-size: 14px;
  color: var(--deep-ink);
  margin-top: 8px;
}
.fj-row b {
  color: var(--cinnabar);
}
.fj-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  margin-top: 2px;
}
.fj-level {
  font-size: 12px;
  letter-spacing: 0.05em;
}
.fj-gold {
  color: var(--gold);
}
.fj-bad {
  color: var(--ink-light);
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
