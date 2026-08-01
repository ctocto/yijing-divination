import { ref, computed } from 'vue'
import { hexagrams } from '@/data/hexagrams'
import { palaces } from '@/data/palaces'

// 模块级单例状态 —— 所有调用 useCompass() 的组件共享同一组 ref
const state = ref('idle')          // 'idle' | 'spinning' | 'casting' | 'reading' | 'browse'
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

  function setRotation(deg) { rotation.value = deg }
  function setState(s) { state.value = s }

  // 指针固定正上方（12 点方向）。宫位 i 中心角 = -90 + i*45；
  // 旋转 r 后指针所指宫位满足 (-90 + i*45 + r) ≡ -90 (mod 360) → i*45 ≡ -r
  function palaceIndexAt(deg) {
    const norm = ((deg % 360) + 360) % 360
    return Math.round(((360 - norm) % 360) / 45) % 8
  }

  // 旋转中指针实时所指宫位名
  const currentPalaceName = computed(() => palaces[palaceIndexAt(rotation.value)].name)

  // 旋转完全停止后调用：按指针宫位随机取一卦，进入阅读态
  function completeSpin() {
    const palace = palaces[palaceIndexAt(rotation.value)]
    const name = palace.hexagrams[Math.floor(Math.random() * palace.hexagrams.length)]
    divinationResult.value = hexagrams.find(h => h.name === name) || null
    selectedHexagram.value = null
    state.value = 'reading'
  }

  // 点按起卦：罗盘自动旋转 2~3 圈（约 2.5s）后出卦
  function castSpin() {
    if (state.value !== 'idle') return
    state.value = 'casting'
    const start = rotation.value
    const total = 720 + Math.random() * 360   // 2~3 圈
    const duration = 2500                      // ms
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      setRotation(start + total * (1 - Math.pow(1 - p, 3))) // ease-out cubic
      if (p < 1) requestAnimationFrame(step)
      else completeSpin()
    }
    requestAnimationFrame(step)
  }

  // 闲观态下点击卦符 → 浏览模式
  function selectHexagram(hexagram) {
    if (state.value !== 'idle' && state.value !== 'browse') return
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

  // 卦库浏览态开关
  function openLibrary() { state.value = 'browse' }
  function closeLibrary() { state.value = 'idle' }

  return {
    state,
    rotation,
    selectedHexagram,
    divinationResult,
    selectedDirection,
    customDirection,
    direction,
    currentPalaceName,
    setRotation,
    setState,
    palaceIndexAt,
    completeSpin,
    castSpin,
    selectHexagram,
    clearSelection,
    resetToIdle,
    openLibrary,
    closeLibrary,
  }
}
