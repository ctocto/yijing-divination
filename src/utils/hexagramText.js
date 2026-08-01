// 把卦象整理成便于粘贴给外部工具（如大模型）解读的文本
export function buildHexagramText(hexagram, direction = '') {
  if (!hexagram) return ''
  const yang = (hexagram.binary.match(/1/g) || []).length
  const yin = 6 - yang
  const parts = []
  if (direction) parts.push(`【所问】${direction}`)
  parts.push(`【卦名】${hexagram.name}`)
  parts.push(`【卦象】${yang}阳${yin}阴（${hexagram.binary}）`)
  parts.push(`【卦辞】${hexagram.text}`)
  if (hexagram.plain) parts.push(`【白话释义】${hexagram.plain}`)
  parts.push('【爻辞】')
  parts.push(...hexagram.lines)
  return parts.join('\n')
}
