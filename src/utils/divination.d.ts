import { Hexagram } from '@/data/hexagrams';

/**
 * 生成随机六爻卦象
 * @returns 包含6个数字的数组，0表示阴爻，1表示阳爻
 */
export function generateHexagram(): number[];

/**
 * 根据卦象获取卦名
 * @param hexagram 六爻卦象数组
 * @returns 卦名
 */
export function getHexagramName(hexagram: number[]): string;

/**
 * 获取卦辞
 * @param hexagramName 卦名
 * @returns 卦辞
 */
export function getHexagramText(hexagramName: string): string;

/**
 * 获取爻辞
 * @param hexagram 六爻卦象数组
 * @returns 包含6个爻辞的数组
 */
export function getLineTexts(hexagram: number[]): string[];