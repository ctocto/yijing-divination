/**
 * 表示单个卦象的类型
 */
export interface Hexagram {
  binary: string; // 二进制字符串，表示卦象
  name: string;   // 卦名
  text: string;   // 卦辞
  lines: string[]; // 包含6个爻辞的数组
}

/**
 * 64卦数据
 */
export const hexagrams: Hexagram[];