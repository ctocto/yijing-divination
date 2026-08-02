import type { Mountain } from '../data/luopan';

export function itemAt<T extends { [k: string]: unknown }>(
  deg: number,
  items: T[],
  angleKey?: string
): T;
export function termAt(deg: number): string;
export function jiaziAt(deg: number): string;
export function plateMountainAt(deg: number, plate: Mountain[]): string;
export function hexagramAt(deg: number): string;
export function mansionAt(deg: number): string;
