import { hexagrams } from '@/data/hexagrams';

/**
 * 生成随机六爻卦象
 * @returns {Array} 包含6个数字的数组，0表示阴爻，1表示阳爻
 */
export function generateHexagram() {
  return Array.from({length: 6}, () => Math.round(Math.random()));
}

/**
 * 根据卦象获取卦名
 * @param {Array} hexagram 六爻卦象数组
 * @returns {String} 卦名
 */
export function getHexagramName(hexagram) {
  const key = hexagram.join('');
  const hexagramData = hexagrams.find(h => h.binary === key);
  return hexagramData?.name || '未知卦';
}

/**
 * 获取卦辞
 * @param {String} hexagramName 卦名
 * @returns {String} 卦辞
 */
export function getHexagramText(hexagramName) {
  const hexagramData = hexagrams.find(h => h.name === hexagramName);
  return hexagramData?.text || '无卦辞信息';
}

/**
 * 获取爻辞
 * @param {Array} hexagram 六爻卦象数组
 * @returns {Array} 包含6个爻辞的数组
 */
export function getLineTexts(hexagram) {
  const key = hexagram.join('');
  const hexagramData = hexagrams.find(h => h.binary === key);
  return hexagramData?.lines || Array(6).fill('无爻辞信息');
}