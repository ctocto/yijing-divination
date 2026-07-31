# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An I Ching (易经) divination web app — Vue 3 + Vite + vue-router, client-only (no backend). UI text and code comments are in Chinese. Currently implements 六爻占卜 (six-line casting); 梅花易数, IndexedDB history, and tests (Vitest/Cypress) are planned but not yet built. The design document `易经占卜程序设计.md` is the source of truth for planned work.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`). There is no test or lint script configured.

- `pnpm dev` — start the Vite dev server
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve the production build locally
- Ad-hoc checks (ESLint + Prettier installed as devDependencies): `npx eslint .`, `npx prettier --check .`

## Architecture

### Routing and views
Two routes in `src/router/index.js`, both lazy-loaded: `/` (Home) and `/divination` (HexagramDivination). Home renders a full-page decorative `HexagramChart`; clicking it navigates to the divination page. `src/views/Divination/HexagramDivination.vue` is the core flow: optional question-direction selector, a "随机生成卦象" button that calls the divination utils and renders the results (chart highlight, 卦名, 卦辞, 爻辞, a colloquial interpretation). The selected direction is captured but not yet used in the interpretation.

### Core domain model
- A hexagram is a `number[]` of length 6: `0` = 阴爻 (yin), `1` = 阳爻 (yang), stored bottom-line-first.
- It is converted to a lookup key via `hexagram.join('')` (a 6-char binary string), matched against `src/data/hexagrams.js`, which holds records of shape `{ binary, name, text, lines[6] }`.
- **`src/data/hexagrams.js` is incomplete** — it has 60 of the 64 hexagrams (the file ends at 节; the last four King Wen hexagrams 中孚/小过/既济/未济 are missing). Lookups are linear `Array.find` scans; misses fall back to `'未知卦'` / `'无卦辞信息'`.
- `src/utils/divination.js` holds the pure logic: `generateHexagram()`, `getHexagramName()`, `getHexagramText()`, `getLineTexts()`. Randomness is plain `Math.random()` — no yarrow-stalk/coin probabilities.

### Hybrid JS + TS setup
Runtime entry, router, utils, and data are plain JS (`main.js`, `*.js`), but every SFC uses `<script setup lang="ts">` and each JS module ships a sibling `.d.ts` declaration file. Follow this pattern: JS implementation + `.d.ts` types. Vite aliases: `@` → `src`, `@components` → `src/components`, `@utils` → `src/utils`. Note `tsconfig.json` only knows the `@/*` path, not `@components`/`@utils`.

### SVG component library
`src/components/hexagram/*.vue` are pure SVG primitives that render `<g>` groups (they must be placed inside an `<svg>`), not standalone elements: `TaijiSymbol` (yin-yang), `TrigramSymbol`, `HexagramSymbol`, `HexagramDescription` (text card with auto line-wrapping, takes `direction`), `HexagramRelationship` (connector lines). All props via plain `defineProps`.

### HexagramChart
`src/components/HexagramChart.vue` is a large decorative 800×800 SVG compass diagram (八卦 sectors with 天干/地支/五行 annotations, a central taiji, decorative calligraphy). Two non-obvious couplings:
- It maps the 8 sector-primary hexagrams as `hexagrams[i * 8]` — it assumes the data array is ordered so indices 0, 8, 16, …, 56 are the 8 pure-trigram hexagrams. Reordering `hexagrams.js` breaks the chart.
- Line rendering splits `binary` and `.reverse()`s it (display is top-down, data is bottom-up).
- `highlightBinary` prop turns the matching hexagram red; the divination page passes the cast hexagram's binary string.

## Project rules

`/.roo/rules/*.md` (mirrored as `.mdc`) encode the team conventions; follow them: Vue 3 Composition API with `<script setup>`; `ref`/`reactive`/`computed` for state; TypeScript for type safety with proper props/emits; single-responsibility components; ESLint + Prettier formatting enforced; use Vite idioms.
