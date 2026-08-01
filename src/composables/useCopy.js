import { ref } from 'vue'

// 复制文本到剪贴板，带「已复制」反馈（2s 后复位）
export function useCopy() {
  const copied = ref(false)
  let timer = null

  async function copyText(text) {
    if (!text) return
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy(text)
      }
    } catch {
      fallbackCopy(text)
    }
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 2000)
  }

  return { copied, copyText }
}

// 兼容非安全上下文 / 旧浏览器
function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch {
    /* 忽略 */
  }
  document.body.removeChild(ta)
}
