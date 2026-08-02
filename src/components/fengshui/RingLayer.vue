<template>
  <g>
    <!-- ticks：1° 细线、15° 主刻度、90° 大字 -->
    <template v-if="type === 'ticks'">
      <line
        v-for="(it, i) in items"
        :key="'l' + i"
        :x1="pos(it.angle, radius - tickLen(it)).x"
        :y1="pos(it.angle, radius - tickLen(it)).y"
        :x2="pos(it.angle, radius).x"
        :y2="pos(it.angle, radius).y"
        :stroke="it.big ? theme.gold : theme.goldLight"
        :stroke-width="it.big ? 1.2 : 0.6"
      />
      <text
        v-for="(it, i) in bigItems"
        :key="'t' + i"
        :x="pos(it.angle, radius - 16).x"
        :y="pos(it.angle, radius - 16).y"
        text-anchor="middle"
        dominant-baseline="central"
        class="deg-label"
        >{{ it.label }}</text
      >
    </template>

    <!-- labels：文字 + 选中高亮 -->
    <template v-else-if="type === 'labels'">
      <g
        v-for="(it, i) in items"
        :key="'L' + i"
        :transform="`translate(${pos(it.angle, radius).x}, ${pos(it.angle, radius).y}) rotate(${it.angle})`"
        text-anchor="middle"
        dominant-baseline="central"
        @pointerdown.stop="interactive && $emit('itemTap', it)"
      >
        <rect
          v-if="it.active"
          x="-16"
          y="-14"
          width="32"
          height="30"
          rx="3"
          :fill="activeFill"
        />
        <text :class="['label', { active: it.active }]">{{ it.text }}</text>
      </g>
    </template>

    <!-- glyphs：卦爻符号（binary）或 单字符号（glyph + 可选 sub） -->
    <template v-else>
      <g
        v-for="(it, i) in items"
        :key="'G' + i"
        :transform="`translate(${pos(it.angle, radius).x}, ${pos(it.angle, radius).y})`"
        text-anchor="middle"
        @pointerdown.stop="interactive && $emit('itemTap', it)"
      >
        <HexLines v-if="it.binary" :binary="it.binary" :size="GLYPH_SIZE" />
        <template v-else>
          <text :y="-8" class="glyph" dominant-baseline="central">{{
            it.glyph
          }}</text>
          <text
            v-if="it.sub"
            :y="16"
            class="glyph-sub"
            dominant-baseline="central"
            >{{ it.sub }}</text
          >
        </template>
      </g>
    </template>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HexLines from '../chart/HexLines.vue';
import { theme } from '@/styles/theme';

const props = defineProps({
  type: { type: String, required: true }, // 'ticks' | 'labels' | 'glyphs'
  radius: { type: Number, required: true },
  items: { type: Array, default: () => [] },
  interactive: { type: Boolean, default: false },
});
defineEmits(['itemTap']);

const GLYPH_SIZE = 14; // 卦爻符号总宽（64 卦环用）

const pos = (a, r) => ({
  x: Math.sin((a * Math.PI) / 180) * r,
  y: -Math.cos((a * Math.PI) / 180) * r,
});

const tickLen = (it) => (it.big ? 10 : it.major ? 6 : 3);
const bigItems = computed(() => props.items.filter((it) => it.label));
const activeFill = 'rgba(178,58,46,0.14)';
</script>

<style scoped>
.label {
  font-size: 17px;
  fill: var(--ink);
  pointer-events: none;
}
.label.active {
  fill: var(--cinnabar);
  font-size: 19px;
  font-weight: 700;
}
.deg-label {
  font-size: 11px;
  fill: var(--gold);
  pointer-events: none;
}
.glyph {
  font-size: 26px;
  fill: var(--ink-light);
  pointer-events: none;
}
.glyph-sub {
  font-size: 11px;
  fill: var(--ink-light);
  pointer-events: none;
}
</style>
