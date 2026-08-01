<template>
  <g class="hexagram-ring">
    <template v-for="(palace, pIdx) in palaces" :key="pIdx">
      <HexagramGlyph
        v-for="(name, hIdx) in palace.hexagrams"
        :key="name"
        :x="positionOf(pIdx, hIdx).x"
        :y="positionOf(pIdx, hIdx).y"
        :hexagram="hexagramByName(name)"
        :highlighted="litNames.has(name)"
        :selected="selectedName === name"
        @click="onGlyphClick(name)"
      />
    </template>

  </g>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import HexagramGlyph from './HexagramGlyph.vue'
import { palaces } from '@/data/palaces'
import { hexagrams } from '@/data/hexagrams'
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

// 出卦后该宫 8 卦逐一进入 highlighted（每 120ms 一盏，点亮后保持朱砂态）
const litNames = ref(new Set())
let revealTimers = []
watch(
  () => divinationResult.value,
  (result) => {
    litNames.value = new Set()
    revealTimers.forEach(clearTimeout)
    revealTimers = []
    if (!result) return
    const palace = palaces.find(p => p.hexagrams.includes(result.name))
    if (!palace) return
    palace.hexagrams.forEach((name, i) => {
      revealTimers.push(
        setTimeout(() => {
          litNames.value = new Set([...litNames.value, name])
        }, i * 120)
      )
    })
  }
)
onBeforeUnmount(() => revealTimers.forEach(clearTimeout))

function onGlyphClick(name) {
  if (state.value !== 'idle') return
  if (selectedName.value === name) clearSelection()
  else selectHexagram(hexagramByName(name))
}
</script>
