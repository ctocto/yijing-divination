<template>
  <div class="fs-view" role="dialog" aria-label="风水 · 罗盘宅运">
    <header class="fs-header">
      <h1 class="fs-title">风水 · 罗盘宅运</h1>
      <div class="fs-actions">
        <button
          class="fs-close"
          type="button"
          aria-label="操作手册"
          @click="$emit('help', helpSectionId)"
        >
          ？
        </button>
        <button
          class="fs-close"
          type="button"
          aria-label="关闭"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
    </header>

    <div class="fs-body">
      <section class="fs-luopan">
        <Luopan
          :mountain="selectedDir"
          :mode="luopanMode"
          :ring-slot="ringSlot"
          :fine-angle="luopanMode === 'ding' ? fineAngle : null"
          @select="selectedDir = $event"
          @settle="onSettleMountain"
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
          <div class="mode-toggle" role="group" aria-label="定向圈位">
            <button
              v-for="s in RING_SLOTS"
              :key="s.id"
              type="button"
              :class="{ active: ringSlot === s.id }"
              @click="ringSlot = s.id"
            >
              {{ s.label }}
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
          <template v-if="luopanMode === 'ding' && ringSlot === 'fenjin'"
            >坐{{ shan }}·{{ fenjin?.shan.name ?? '骑缝' }}({{
              fenjin?.shan.level ?? '–'
            }}) 朝{{ xiang }}·{{ fenjin?.xiang.name ?? '骑缝' }}({{
              fenjin?.xiang.level ?? '–'
            }})</template
          >
          <template v-else-if="luopanMode === 'ding'"
            >坐{{ shan }}·{{ slotShanName }}({{ slotShanLevel }}) 朝{{
              xiang
            }}·{{ slotXiangName }}({{ slotXiangLevel }})</template
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
          <h2>{{ slotTitle }}</h2>
          <template v-if="ringSlot === 'fenjin'">
            <p class="fj-hint">点按居中即正向·龟甲，拖拽微调至旺相分金</p>
            <div class="fj-xianming">
              <label for="xianming-year">仙命（出生年）：</label>
              <input
                id="xianming-year"
                v-model.number="xianMingYear"
                type="number"
                inputmode="numeric"
                placeholder="如 1948"
                min="1"
                max="9999"
              />
              <button
                v-if="xianMingYear"
                type="button"
                class="fj-xm-clear"
                @click="xianMingYear = null"
              >
                清空
              </button>
            </div>
            <p v-if="xianMingInfo" class="fj-xm-head">
              仙命 <b>{{ xianMingInfo.name }}</b> · {{ xianMingInfo.nian }}
            </p>
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
              <p
                v-if="shanXm"
                class="fj-text fj-xm"
                :class="shanXm.ji === '吉' ? 'fj-xm-good' : 'fj-xm-bad'"
              >
                仙命配分金：{{ shanXm.text }}
              </p>
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
              <p
                v-if="xiangXm"
                class="fj-text fj-xm"
                :class="xiangXm.ji === '吉' ? 'fj-xm-good' : 'fj-xm-bad'"
              >
                仙命配分金：{{ xiangXm.text }}
              </p>
            </template>
          </template>

          <template v-else-if="ringSlot === 'chuanShan'">
            <p class="fj-hint">
              穿山七十二龙 · 正针 · 甲子起壬末；旺相可用，孤虚/龟甲/大空亡不可用
            </p>
            <template v-if="chuanShan">
              <p class="fj-row">
                坐龙：<b>{{ slotShanName }}</b
                >（{{ chuanShan.shan.nian || '—' }}）·
                <span
                  class="fj-level"
                  :class="chuanShan.shan.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                  >{{ chuanShan.shan.level }}</span
                >
                · {{ chuanShan.shan.ji }}
              </p>
              <p class="fj-row">
                向龙：<b>{{ slotXiangName }}</b
                >（{{ chuanShan.xiang.nian || '—' }}）·
                <span
                  class="fj-level"
                  :class="chuanShan.xiang.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                  >{{ chuanShan.xiang.level }}</span
                >
                · {{ chuanShan.xiang.ji }}
              </p>
              <p class="fj-text">
                十字线压旺相龙为吉线，安坟立宅人财兴旺；孤虚/龟甲/大空亡为凶线，宜避。
              </p>
            </template>
          </template>

          <template v-else>
            <p class="fj-hint">
              透地六十龙 · 平分 ·
              甲子起壬初；丙子/庚子二旬珠宝吉，甲子/壬子旬差错空亡，戊子旬火坑煞曜
            </p>
            <template v-if="touDi">
              <p class="fj-row">
                坐龙：<b>{{ slotShanName }}</b
                >（{{ touDi.shan.nian }} · {{ touDi.shan.qi }}气）·
                <span
                  class="fj-level"
                  :class="touDi.shan.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                  >{{ touDi.shan.level }}</span
                >
                · {{ touDi.shan.ji }}
              </p>
              <p class="fj-row">
                向龙：<b>{{ slotXiangName }}</b
                >（{{ touDi.xiang.nian }} · {{ touDi.xiang.qi }}气）·
                <span
                  class="fj-level"
                  :class="touDi.xiang.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                  >{{ touDi.xiang.level }}</span
                >
                · {{ touDi.xiang.ji }}
              </p>
              <p class="fj-text">
                取旺相珠宝穴，导龙气入穴；孤虚差错与火坑煞曜为凶，宜避。
              </p>
            </template>
          </template>
          <p class="fs-disclaimer">{{ slotDisclaimer }}</p>
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
          <h2>抽爻换象 · 玄空大卦</h2>
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
              @click="pickYao(i - 1)"
            >
              {{ yaoLines[i - 1] }}
            </button>
          </div>
          <div class="yi-auto-row">
            <label class="yi-auto">
              <input
                type="checkbox"
                :checked="autoYao"
                @change="toggleAutoYao"
              />
              自动抽爻
            </label>
            <span v-if="autoYaoName" class="yi-auto-hint"
              >线压 {{ autoYaoName }}爻</span
            >
          </div>
          <p class="yi-hint">
            {{ autoYao ? '转盘即线压爻动；点爻可转手动' : '手动选一爻为动爻' }}
          </p>
          <p class="yi-fenjin">配分金：{{ guaFenjinText }}</p>
          <template v-if="chouYao">
            <p class="yi-line-text">
              动爻 <b>{{ chouYao.line }}</b>
            </p>
            <p class="yi-bian">
              变卦 <b>{{ chouYao.bian }}</b> —— {{ chouYao.bianText }}（{{
                chouYao.bianPlain
              }}）
            </p>
            <p
              v-if="guaQi"
              class="yi-guaqi"
              :class="guaQi.ji === '吉' ? 'ok' : guaQi.ji === '凶' ? 'bad' : ''"
            >
              卦气：{{ guaQi.text }}
            </p>
          </template>
          <p v-else class="yi-none">选一爻看变卦</p>
          <p class="fs-disclaimer">玄空大卦抽爻 · 文化参考</p>
        </section>
      </template>

      <template v-else-if="luopanMode === 'ze'">
        <section class="fs-zeri">
          <h2>择日判断</h2>
          <div class="zeri-source" role="group" aria-label="择日来源">
            <button
              type="button"
              :class="{ active: zeriSource === 'calendar' }"
              @click="zeriSource = 'calendar'"
            >
              日历
            </button>
            <button
              type="button"
              :class="{ active: zeriSource === 'read' }"
              @click="zeriSource = 'read'"
            >
              读盘
            </button>
          </div>
          <template v-if="zeriSource === 'calendar'">
            <input
              v-model="zeriDate"
              type="date"
              class="zeri-date-input"
              aria-label="选择日期"
            />
            <template v-if="zeriDateInfo">
              <p class="zeri-head">
                {{ zeriDate }} ·
                <b
                  >{{ zeriDateInfo.yearGz }}年 {{ zeriDateInfo.monthGz }}月
                  {{ zeriDateInfo.dayGz }}日</b
                >（{{ zeriDateInfo.nian }}）
              </p>
              <p class="zeri-main">
                {{ zeriDateInfo.monthB }}月 · {{ zeriDateInfo.dayB }}日 ·
                <b>{{ zeriDateInfo.jianChu?.name ?? '–' }}</b
                >日（{{ zeriDateInfo.huangDao?.name ?? '–' }} ·
                {{ zeriDateInfo.huangDao?.dao ?? '–' }}道）
              </p>
              <p class="zeri-text">{{ zeriDateInfo.jianChu?.text ?? '' }}</p>
            </template>
          </template>
          <template v-else>
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
          </template>
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
import {
  judgeChouYao,
  drawLine,
  lineName,
  yaoAt,
  judgeGuaQi,
} from '@/utils/yijing';
import { judgeZeri, judgeZeriByDate } from '@/utils/zeri';
import {
  judgeFenjin,
  fenjinAt,
  yearGanZhi,
  judgeXianMing,
} from '@/utils/fenjin';
import { chuanShanAt, touDiAt } from '@/utils/luopanRead';
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

defineEmits(['close', 'help']);

const mode = ref('坐山'); // '坐山' | '朝向'
const selectedDir = ref('子'); // 红针所指 24 山（默认坐子朝午）
const period = ref(9); // 默认九运（2024-2043）
const luopanMode = ref('ding'); // 定向 | 消砂 | 纳水 | 择日 | 易卦
const readout = ref(null); // Luopan 读数
// 操作手册「？」定位章节：按当前模式跳转（ding 含分金/穿山/透地/飞星，统一落 ding 章）
const HELP_SECTION = { ding: 'ding', xiao: 'xiao', na: 'na', ze: 'ze', gua: 'gua' };
const helpSectionId = computed(
  () => HELP_SECTION[luopanMode.value] || 'overview'
);
// 定向圈位：分金 / 穿山 / 透地 共用一圈位，一次只显示一个（默认分金）
const ringSlot = ref('fenjin');
const RING_SLOTS = [
  { id: 'fenjin', label: '分金' },
  { id: 'chuanShan', label: '穿山' },
  { id: 'touDi', label: '透地' },
];

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
    // 进入易卦模式且为自动抽爻：立即按当前角度定动爻
    if (m === 'gua' && autoYao.value && readout.value?.angle !== undefined) {
      movingYao.value = yaoAt(readout.value.angle).index;
    }
  }
);
// 分金判断：坐 = 坐山物理角度，向 = 坐 +180°
// 朝向口径下坐山为十字线对宫（+180°），与 shan/xiang 一致，避免坐向分金错配
const fenjin = computed(() => {
  if (readout.value?.angle === undefined) return null;
  const shanAngle = readout.value.angle + (mode.value === '坐山' ? 0 : 180);
  return judgeFenjin(shanAngle);
});

// 圈位读数（穿山/透地）：坐 = 十字线物理角（朝向口径 +180，与 fenjin 一致），向 = 坐 +180°
const longAngle = computed(() =>
  readout.value?.angle === undefined
    ? null
    : readout.value.angle + (mode.value === '坐山' ? 0 : 180)
);
const chuanShan = computed(() =>
  longAngle.value === null
    ? null
    : {
        shan: chuanShanAt(longAngle.value),
        xiang: chuanShanAt((longAngle.value + 180) % 360),
      }
);
const touDi = computed(() =>
  longAngle.value === null
    ? null
    : {
        shan: touDiAt(longAngle.value),
        xiang: touDiAt((longAngle.value + 180) % 360),
      }
);
const slotLong = computed(() =>
  ringSlot.value === 'chuanShan'
    ? chuanShan.value
    : ringSlot.value === 'touDi'
      ? touDi.value
      : null
);
const slotShanName = computed(() => slotLong.value?.shan.name || '大空亡');
const slotShanLevel = computed(() => slotLong.value?.shan.level ?? '–');
const slotXiangName = computed(() => slotLong.value?.xiang.name || '大空亡');
const slotXiangLevel = computed(() => slotLong.value?.xiang.level ?? '–');
const slotTitle = computed(() => {
  const map = {
    fenjin: '分金吉凶',
    chuanShan: '穿山七十二龙',
    touDi: '透地六十龙',
  };
  return map[ringSlot.value] || '分金吉凶';
});
const slotDisclaimer = computed(() => {
  const map = {
    fenjin: '一百二十分金 · 文化参考',
    chuanShan: '穿山七十二龙（正针） · 文化参考',
    touDi: '透地六十龙（平分） · 杨公五气 · 文化参考',
  };
  return map[ringSlot.value] || '';
});

// 仙命配分金：仙命出生年 → 年干支纳音 → 与坐/向分金纳音生克
const xianMingYear = ref(null); // 仙命出生年（阴宅）
const xianMingInfo = computed(() =>
  xianMingYear.value ? yearGanZhi(xianMingYear.value) : null
);
const shanXm = computed(() =>
  xianMingYear.value && fenjin.value?.shan?.nian
    ? judgeXianMing(xianMingYear.value, fenjin.value.shan.nian)
    : null
);
const xiangXm = computed(() =>
  xianMingYear.value && fenjin.value?.xiang?.nian
    ? judgeXianMing(xianMingYear.value, fenjin.value.xiang.nian)
    : null
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
const autoYao = ref(true); // 自动抽爻（十字线线压爻动）；关 → 手动选爻
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
// 卦气：变卦内外卦先天洛书数 合五/合十/合十五/生成数 → 吉（玄空大卦抽爻断法）
const guaQi = computed(() =>
  movingYao.value !== null && benBinary.value
    ? judgeGuaQi(drawLine(benBinary.value, movingYao.value))
    : null
);
// 自动抽爻当前线压爻名（如 初九）
const autoYaoName = computed(() =>
  autoYao.value && movingYao.value !== null && benBinary.value
    ? lineName(benBinary.value, movingYao.value)
    : ''
);
// 配分金：十字线当前角度 120 分金（抽爻换象配分金定卦气）
const guaFenjin = computed(() =>
  readout.value?.angle !== undefined ? fenjinAt(readout.value.angle) : null
);
const guaFenjinText = computed(() => {
  const f = guaFenjin.value;
  if (!f) return '–';
  if (f.type === 'kongwang') return '骑缝空亡';
  return `${f.name}·${f.level}（${f.nian || '—'}）`;
});

// —— 择日 ——
const zeriInfo = computed(() =>
  readout.value?.term && readout.value?.jiazi
    ? judgeZeri(readout.value.term, readout.value.jiazi)
    : null
);
// —— 择日（真实日历）——
const zeriSource = ref('calendar'); // 'calendar' 日历 | 'read' 读盘
const zeriDate = ref(todayStr()); // YYYY-MM-DD，默认今天
const zeriDateInfo = computed(() => {
  if (zeriSource.value !== 'calendar' || !zeriDate.value) return null;
  const [y, m, d] = zeriDate.value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return judgeZeriByDate(y, m, d);
});
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

// 自动抽爻：十字线角度 → 所压卦爻（线压爻动）；易卦模式实时联动变卦
watch(
  () => readout.value?.angle,
  (a) => {
    if (luopanMode.value === 'gua' && autoYao.value && a !== undefined) {
      movingYao.value = yaoAt(a).index;
    }
  }
);
// 手动抽爻时换坐向卦清空（自动模式由角度 watch 接管）
watch(
  () => readout.value?.hexagram,
  () => {
    if (!autoYao.value) movingYao.value = null;
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

// 点按选山（settle）：归位该山中心（龟甲）并清空拖拽/传感残留细角；
// 与拖拽释放的 select 区分——select 保留 3° 分金细角，settle 才重置归中
function onSettleMountain(name) {
  selectedDir.value = name;
  fineAngle.value = null;
}

// 点爻 → 手动抽爻（补助元运之不足，可主动选动爻）
function pickYao(i) {
  movingYao.value = i;
  autoYao.value = false;
}

// 自动抽爻开关：开 → 按当前角度线压爻动
function toggleAutoYao() {
  autoYao.value = !autoYao.value;
  if (autoYao.value && readout.value?.angle !== undefined) {
    movingYao.value = yaoAt(readout.value.angle).index;
  }
}

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
.fs-actions {
  display: flex;
  align-items: center;
  gap: 4px;
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
  width: min(100%, 540px);
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
.zeri-source {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.zeri-source button {
  padding: 6px 18px;
  font-size: 13px;
  color: var(--ink-light);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-left: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.zeri-source button:first-child {
  border-left: 1px solid var(--gold);
  border-radius: 4px 0 0 4px;
}
.zeri-source button:last-child {
  border-radius: 0 4px 4px 0;
}
.zeri-source button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.zeri-date-input {
  display: block;
  margin: 0 auto 10px;
  padding: 7px 10px;
  font-size: 14px;
  color: var(--deep-ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
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
.fj-xianming {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--ink);
}
.fj-xianming input {
  width: 110px;
  padding: 6px 8px;
  font-size: 14px;
  color: var(--deep-ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
}
.fj-xm-clear {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--ink-light);
  background: none;
  border: 1px dashed var(--gold-light);
  border-radius: 4px;
  cursor: pointer;
}
.fj-xm-head {
  font-size: 13px;
  color: var(--cinnabar);
  margin-top: 6px;
}
.fj-xm {
  color: var(--deep-ink);
}
.fj-xm-good {
  color: var(--gold);
}
.fj-xm-bad {
  color: var(--cinnabar);
}
.yi-auto-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}
.yi-auto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
}
.yi-auto-hint {
  font-size: 12px;
  color: var(--cinnabar);
}
.yi-fenjin {
  font-size: 13px;
  color: var(--gold);
  margin-top: 6px;
}
.yi-guaqi {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--scroll);
  margin-top: 8px;
}
.yi-guaqi.ok {
  color: var(--cinnabar);
}
.yi-guaqi.bad {
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
    grid-template-columns: minmax(380px, 540px) 1fr;
    gap: 20px;
    align-items: start;
  }
  .fs-luopan {
    grid-row: 1 / 3;
    width: 100%;
    margin: 0;
  }
  .fs-pan {
    margin: 0;
  }
}
</style>
