import { ref, computed } from 'vue'
import { hexagrams } from '@/data/hexagrams'

// 模块级单例状态 —— 所有调用 useCompass() 的组件共享同一组 ref
const state = ref('idle')          // 'idle' | 'casting' | 'reading'
const selectedHexagram = ref(null) // 点击浏览的卦象
const divinationResult = ref(null) // 起卦结果卦象对象
const selectedDirection = ref('')  // 方向下拉框
const customDirection = ref('')    // 自定义方向输入
let castTimer = null               // 起卦后进入阅读态前的高亮时长

export function useCompass() {
  const direction = computed(() =>
    selectedDirection.value === '其他'
      ? customDirection.value.trim()
      : selectedDirection.value
  )

  // 闲观态下点击卦符 → 浏览模式
  function selectHexagram(hexagram) {
    if (state.value !== 'idle') return
    selectedHexagram.value = hexagram
  }

  function clearSelection() {
    selectedHexagram.value = null
  }

  // 起卦：均匀随机抽一卦，先点亮（casting）再展开结果（reading）
  function drawHexagram() {
    if (state.value !== 'idle') return
    const name = hexagrams[Math.floor(Math.random() * hexagrams.length)].name
    divinationResult.value = hexagrams.find(h => h.name === name) || null
    selectedHexagram.value = null
    state.value = 'casting'
    clearTimeout(castTimer)
    castTimer = setTimeout(() => { state.value = 'reading' }, 900)
  }

  // 阅读态 → 闲观态
  function resetToIdle() {
    clearTimeout(castTimer)
    state.value = 'idle'
    divinationResult.value = null
    selectedHexagram.value = null
  }

  return {
    state,
    selectedHexagram,
    divinationResult,
    selectedDirection,
    customDirection,
    direction,
    drawHexagram,
    selectHexagram,
    clearSelection,
    resetToIdle,
  }
}
