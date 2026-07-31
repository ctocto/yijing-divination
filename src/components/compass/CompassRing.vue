<template>
  <g
    class="compass-ring"
    :style="{ cursor: state === 'reading' ? 'default' : 'grab' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- 盘面 -->
    <circle :cx="center" :cy="center" :r="discRadius" fill="#fdf9ef" :stroke="theme.gold" stroke-width="1.5" />
    <circle :cx="center" :cy="center" :r="discRadius - 8" fill="none" :stroke="theme.goldLight" stroke-width="0.8" />
    <!-- 八条方位分隔线 -->
    <line
      v-for="i in 8"
      :key="`line-${i}`"
      :x1="center + (discRadius - 10) * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y1="center + (discRadius - 10) * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :x2="center + 14 * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y2="center + 14 * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :stroke="theme.goldLight"
      stroke-width="0.6"
    />
    <!-- 八宫名 -->
    <text
      v-for="(palace, i) in palaces"
      :key="palace.name"
      :x="center + 150 * Math.cos((i * 45 - 90) * Math.PI / 180)"
      :y="center + 150 * Math.sin((i * 45 - 90) * Math.PI / 180)"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="22"
      font-weight="bold"
      :fill="theme.ink"
      style="font-family: 'Ma Shan Zheng', 'STKaiti', cursive;"
    >{{ palace.name }}</text>
  </g>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { palaces } from '@/data/palaces'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

defineProps({
  center: { type: Number, required: true },
  discRadius: { type: Number, default: 200 },
})

const { state, rotation, setRotation, setState, completeSpin, palaceIndexAt } = useCompass()

const dragging = ref(false)
let startAngle = 0
let startRotation = 0
let lastPointerAngle = 0
let lastTime = 0
let velocity = 0        // deg/ms
let gestureTotal = 0    // 本次手势累计旋转（度）
let animFrame = null

// 指针相对圆心的角度（度）
function pointerAngle(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
}

function onPointerDown(e) {
  if (state.value === 'reading') return
  dragging.value = true
  e.currentTarget.setPointerCapture(e.pointerId)
  startAngle = pointerAngle(e)
  startRotation = rotation.value
  lastPointerAngle = startAngle
  lastTime = performance.now()
  velocity = 0
  gestureTotal = 0
  cancelAnimationFrame(animFrame)
}

function onPointerMove(e) {
  if (!dragging.value) return
  const now = performance.now()
  const cur = pointerAngle(e)
  let delta = cur - lastPointerAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  gestureTotal += delta
  setRotation(startRotation + gestureTotal)
  const dt = Math.max(1, now - lastTime)
  velocity = delta / dt
  lastPointerAngle = cur
  lastTime = now
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  // 旋转极小且速度极低 → 视为误触，不占卜
  if (Math.abs(gestureTotal) < 15 && Math.abs(velocity) < 0.3) return
  setState('spinning')
  animFrame = requestAnimationFrame(inertia)
}

function inertia() {
  velocity *= 0.985
  setRotation(rotation.value + velocity * 16)
  if (Math.abs(velocity) > 0.05) {
    animFrame = requestAnimationFrame(inertia)
  } else {
    animFrame = null
    snapToPalace()
  }
}

// 惯性停止后轻微吸附：将指针所指宫位中心对齐到正上方
function snapToPalace() {
  const idx = palaceIndexAt(rotation.value)
  const target = ((360 - idx * 45) % 360 + 360) % 360
  const current = ((rotation.value % 360) + 360) % 360
  let diff = target - current
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  const start = rotation.value
  const frames = 12
  let f = 0
  const step = () => {
    f += 1
    const t = f / frames
    // ease-out
    setRotation(start + diff * (1 - Math.pow(1 - t, 2)))
    if (f < frames) animFrame = requestAnimationFrame(step)
    else {
      animFrame = null
      completeSpin()
    }
  }
  animFrame = requestAnimationFrame(step)
}

onBeforeUnmount(() => cancelAnimationFrame(animFrame))
</script>
