import { ref, computed } from 'vue'
import { hexagrams } from '@/data/hexagrams'
import { palaces } from '@/data/palaces'

// 模块级单例状态 —— 所有调用 useCompass() 的组件共享同一组 ref
const state = ref('idle')          // 'idle' | 'spinning' | 'reading'
const rotation = ref(0)            // 当前旋转角度（度，可连续累计）
const selectedHexagram = ref(null) // 点击浏览的卦象
const divinationResult = ref(null) // 占卜结果卦象对象
const selectedDirection = ref('')  // 方向下拉框
const customDirection = ref('')    // 自定义方向输入

export function useCompass() {
  const direction = computed(() =>
    selectedDirection.value === '其他'
      ? customDirection.value.trim()
      : selectedDirection.value
  )

  // 指针固定正上方（12 点方向）。宫位 i 中心角 = -90 + i*45；
  // 旋转 r 后指针所指宫位满足 (-90 + i*45 + r) ≡ -90 (mod 360) → i*45 ≡ -r
  function palaceIndexAt(deg) {
    const norm = ((deg % 360) + 360) % 360
    return Math.round(((360 - norm) % 360) / 45) % 8
  }

  // 旋转完全停止后调用：按指针宫位随机取一卦，进入阅读态
  function completeSpin() {
    const palace = palaces[palaceIndexAt(rotation.value)]
    const name = palace.hexagrams[Math.floor(Math.random() * palace.hexagrams.length)]
    divinationResult.value = hexagrams.find(h => h.name === name) || null
    selectedHexagram.value = null
    state.value = 'reading'
  }

  // 闲观态下点击卦符 → 浏览模式
  function selectHexagram(hexagram) {
    if (state.value !== 'idle') return
    selectedHexagram.value = hexagram
  }

  function clearSelection() {
    selectedHexagram.value = null
  }

  // 阅读态 → 闲观态
  function resetToIdle() {
    state.value = 'idle'
    divinationResult.value = null
    selectedHexagram.value = null
  }

  return {
    state,
    rotation,
    selectedHexagram,
    divinationResult,
    selectedDirection,
    customDirection,
    direction,
    setRotation: (deg) => { rotation.value = deg },
    setState: (s) => { state.value = s },
    palaceIndexAt,
    completeSpin,
    selectHexagram,
    clearSelection,
    resetToIdle,
  }
}
