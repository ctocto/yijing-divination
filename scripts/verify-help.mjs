// 校验操作手册内容结构（GUIDE 数据合法，防块类型笔误导致静默不渲染）
import { GUIDE } from '../src/data/helpContent.js';

const TYPES = new Set(['para', 'steps', 'terms', 'table', 'note', 'list']);
const errors = [];

const assertStrings = (arr, at, key) => {
  if (!Array.isArray(arr) || arr.some((s) => typeof s !== 'string' || !s)) {
    errors.push(`${at} ${key} 应为非空字符串数组`);
  }
};

if (!Array.isArray(GUIDE) || GUIDE.length === 0) {
  errors.push('GUIDE 应为非空数组');
} else {
  GUIDE.forEach((ch, ci) => {
    if (!ch || typeof ch.id !== 'string' || !ch.id)
      errors.push(`章节[${ci}] 缺 id`);
    if (!ch || typeof ch.title !== 'string' || !ch.title)
      errors.push(`章节[${ci}] 缺 title`);
    if (!Array.isArray(ch?.blocks)) {
      errors.push(`章节[${ch?.id ?? ci}] blocks 应为数组`);
      return;
    }
    ch.blocks.forEach((b, bi) => {
      const at = `章节[${ch.id}] 块[${bi}]`;
      if (!b || !TYPES.has(b.type)) {
        errors.push(`${at} type 非法: ${b?.type}`);
        return;
      }
      switch (b.type) {
        case 'para':
        case 'note':
          if (typeof b.text !== 'string' || !b.text)
            errors.push(`${at} 缺 text`);
          break;
        case 'list':
          assertStrings(b.items, at, 'items');
          break;
        case 'steps':
          if (typeof b.title !== 'string') errors.push(`${at} 缺 title`);
          assertStrings(b.steps, at, 'steps');
          break;
        case 'terms':
          if (typeof b.title !== 'string') errors.push(`${at} 缺 title`);
          if (
            !Array.isArray(b.items) ||
            b.items.some(
              (t) => !t || typeof t.k !== 'string' || typeof t.v !== 'string'
            )
          ) {
            errors.push(`${at} items 应为 {k,v} 字符串数组`);
          }
          break;
        case 'table':
          if (typeof b.title !== 'string') errors.push(`${at} 缺 title`);
          assertStrings(b.head, at, 'head');
          if (
            !Array.isArray(b.rows) ||
            b.rows.some(
              (r) => !Array.isArray(r) || r.some((c) => typeof c !== 'string')
            )
          ) {
            errors.push(`${at} rows 应为字符串二维数组`);
          }
          break;
      }
    });
  });
}

if (errors.length) {
  console.error('操作手册内容校验失败：');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

const blocks = GUIDE.reduce((n, c) => n + c.blocks.length, 0);
console.log(`操作手册内容校验通过：${GUIDE.length} 章，${blocks} 个内容块`);
