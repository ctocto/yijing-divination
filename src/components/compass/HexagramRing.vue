<template>
  <g class="hexagram-ring">
    <template v-for="(palace, pIdx) in palaces" :key="pIdx">
      <HexagramGlyph
        v-for="(name, hIdx) in palace.hexagrams"
        :key="name"
        :x="positionOf(pIdx, hIdx).x"
        :y="positionOf(pIdx, hIdx).y"
        :hexagram="hexagramByName(name)"
        :highlighted="resultName === name"
        :selected="selectedName === name"
        @click="onGlyphClick(name)"
      />
    </template>

    <!-- 选中卦象的说明标签（矩形以平移点为几何中心，上方/下方不重叠卦符） -->
    <g v-if="selectedHexagram" :transform="`translate(${labelPos.x}, ${labelPos.y})`">
      <rect :x="-58" :y="-20" width="116" height="40" rx="6" fill="#fffdf6" :stroke="theme.gold" stroke-width="1" />
      <text
        x="0"
        y="-6"
        text-anchor="middle"
        font-size="14"
        font-weight="bold"
        :fill="theme.cinnabar"
        style="font-family: 'Ma Shan Zheng', 'STKaiti', cursive;"
      >{{ selectedHexagram.name }}</text>
      <text x="0" y="12" text-anchor="middle" font-size="11" :fill="theme.inkLight">{{ selectedHexagram.text.slice(0, 10) }}</text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HexagramGlyph from './HexagramGlyph.vue'
import { palaces } from '@/data/palaces'
import { hexagrams } from '@/data/hexagrams'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

const props = defineProps({
  center: { type: Number, required: true },
})

const { state, selectedHexagram, divinationResult, selectHexagram, clearSelection } = useCompass()

const R_OUTER = 328
const R_INNER = 285

function hexagramByName(name) {
  return hexagrams.find(h => h.name === name)
}

// 宫位 pIdx 内第 hIdx 个卦的坐标：4 列 × 2 行，列间距 10°；内圈列错开半列 5°，
// 避免内外圈同列卡片矩形在对角位置相碰
function positionOf(pIdx, hIdx) {
  const col = hIdx % 4
  const row = Math.floor(hIdx / 4)
  const colOffset = (col - 1.5) * 10 + (row === 1 ? 5 : 0)
  const angle = (pIdx * 45 - 90 + colOffset) * Math.PI / 180
  const r = row === 0 ? R_OUTER : R_INNER
  return {
    x: props.center + r * Math.cos(angle),
    y: props.center + r * Math.sin(angle),
  }
}

const selectedName = computed(() => selectedHexagram.value?.name || '')
const resultName = computed(() => divinationResult.value?.name || '')

// 说明标签位置：默认在卦符上方，靠顶部时翻转到下方避免溢出
const labelPos = computed(() => {
  const s = selectedHexagram.value
  if (!s) return { x: 0, y: 0 }
  for (let p = 0; p < palaces.length; p++) {
    const idx = palaces[p].hexagrams.indexOf(s.name)
    if (idx >= 0) {
      const pos = positionOf(p, idx)
      return pos.y < 80 ? { x: pos.x, y: pos.y + 44 } : { x: pos.x, y: pos.y - 44 }
    }
  }
  return { x: 0, y: 0 }
})

function onGlyphClick(name) {
  if (state.value !== 'idle') return
  if (selectedName.value === name) clearSelection()
  else selectHexagram(hexagramByName(name))
}
</script>
