// 校验 src/data/hexagrams.js：64 卦、binary 唯一、且与卦象构成（上下卦）一致
// 运行：node scripts/verify-hexagrams.mjs
const expected = {
  乾: '111111', 坤: '000000', 屯: '100010', 蒙: '010001',
  需: '111010', 讼: '010111', 师: '010000', 比: '000010',
  小畜: '111011', 履: '110111', 泰: '111000', 否: '000111',
  同人: '101111', 大有: '111101', 谦: '001000', 豫: '000100',
  随: '100110', 蛊: '011001', 临: '110000', 观: '000011',
  噬嗑: '100101', 贲: '101001', 剥: '000001', 复: '100000',
  无妄: '100111', 大畜: '111001', 颐: '100001', 大过: '011110',
  坎: '010010', 离: '101101', 咸: '001110', 恒: '011100',
  遯: '001111', 大壮: '111100', 晋: '000101', 明夷: '101000',
  家人: '101011', 睽: '110101', 蹇: '001010', 解: '010100',
  损: '110001', 益: '100011', 夬: '111110', 姤: '011111',
  萃: '000110', 升: '011000', 困: '010110', 井: '011010',
  革: '101110', 鼎: '011101', 震: '100100', 艮: '001001',
  渐: '001011', 归妹: '110100', 丰: '101100', 旅: '001101',
  巽: '011011', 兑: '110110', 涣: '010011', 节: '110010',
  中孚: '110011', 小过: '001100', 既济: '101010', 未济: '010101',
}

const { hexagrams } = await import('../src/data/hexagrams.js')
let failed = false

if (hexagrams.length !== 64) {
  console.error(`数量错误：${hexagrams.length}，应为 64`)
  failed = true
}

const seen = new Set()
for (const h of hexagrams) {
  if (seen.has(h.binary)) {
    console.error(`binary 重复：${h.name}（${h.binary}）`)
    failed = true
  }
  seen.add(h.binary)
  if (expected[h.name] !== h.binary) {
    console.error(`binary 错误：${h.name} 应为 ${expected[h.name]}，实为 ${h.binary}`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('✓ 64 卦数据完整，binary 全部正确，无重复')
