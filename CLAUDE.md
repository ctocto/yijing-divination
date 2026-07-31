# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An I Ching (易经) divination web app — Vue 3 + Vite + vue-router, client-only (no backend). UI text and code comments are in Chinese. Single-page compass interaction: spin the ring to cast a hexagram (六爻占卜), browse all 64 hexagrams on the ring, and read result interpretations in a scrolling panel. 梅花易数, IndexedDB history, and tests (Vitest/Cypress) are planned but not yet built. The design document `易经占卜程序设计.md` is the source of truth for planned work.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`). There is no test or lint script configured.

- `pnpm dev` — start the Vite dev server
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve the production build locally
- `node scripts/verify-hexagrams.mjs` — verify hexagram data integrity (binary uniqueness, line counts, trigram decomposition)
- Ad-hoc checks (ESLint + Prettier installed as devDependencies): `npx eslint .`, `npx prettier --check .`

## Architecture

### Routing and views
Single-page app with one route in `src/router/index.js`: `/` loads `src/views/Home.vue`, which composes `CompassCore` (always visible) and `ResultScroll` (conditionally, when `state === 'reading'`). No `/divination` route.

### Core domain model
- A hexagram is represented as a binary string of length 6: `'1'` = 阳爻 (yang), `'0'` = 阴爻 (yin), stored bottom-line-first. Display rendering reverses the order (top-down).
- `src/data/hexagrams.js` holds all 64 hexagrams with records of shape `{ binary, name, description, text, lines[6] }`. All 64 entries are present with corrected `binary` values (previously many were wrong — the canonical King Wen binary strings were adapted from published stemma data, not the previous hand-typed values). Lookups are linear `Array.find` scans; misses fall back to `'未知卦'` / `'无卦辞信息'`.
- `src/data/palaces.js` — the 八宫卦序 (Eight Palace hexagram order): 8 palaces, each with a name, trigram character, and list of 8 hexagram names. Used by the compass ring for directional attribution and by the spinning logic to pick a random hexagram from the pointed palace.
- `src/data/trigrams.js` — annotations for the 八卦 (乾/兑/离/震/巽/坎/艮/坤): name, symbol, element, direction, season, family-member, attribute.
- `scripts/verify-hexagrams.mjs` — data integrity check: validates that all 64 binaries are unique, each has 6 lines, line distribution matches expected trigram compositions, and decimal values match the canonical King Wen ordering.
- `src/utils/divination.js` holds pure logic: `generateHexagram()`, `getHexagramName()`, `getHexagramText()`, `getLineTexts()`. Randomness is plain `Math.random()` — no yarrow-stalk/coin probabilities. This module is still on disk but currently unused by the compass-driven flow.

### State & composable
`src/composables/useCompass.js` is the central state machine, implemented as a module-level singleton (refs declared at module scope, shared by all callers):

| Field | Type | Description |
|-------|------|-------------|
| `state` | `'idle' \| 'spinning' \| 'reading'` | Application mode |
| `rotation` | `number` | Current compass rotation in degrees (accumulates across spins) |
| `selectedHexagram` | `object \| null` | Hexagram clicked for browsing in idle mode |
| `divinationResult` | `object \| null` | Hexagram object from the last complete spin |
| `selectedDirection` | `string` | Direction selector value |
| `customDirection` | `string` | Custom direction text input |
| `direction` | `computed<string>` | Effective direction (selector value or custom) |

Key methods: `setRotation()`, `setState()`, `palaceIndexAt(deg)`, `completeSpin()` (snaps to nearest palace, picks a random hexagram from it, transitions to `'reading'`), `selectHexagram()`, `clearSelection()`, `resetToIdle()`.

A sibling `useCompass.d.ts` provides TypeScript declarations.

### Hybrid JS + TS setup
Runtime entry, router, utils, data, composables, and theme are plain JS (`main.js`, `*.js`), but every SFC uses `<script setup lang="ts">` and each JS module ships a sibling `.d.ts` declaration file. Follow this pattern: JS implementation + `.d.ts` types. Vite aliases: `@` → `src`, `@components` → `src/components`, `@utils` → `src/utils`. Note `tsconfig.json` only knows the `@/*` path, not `@components`/`@utils`.

### SVG component library
**Compass ring components** (`src/components/compass/`):
- `CompassCore.vue` — composition root: renders the SVG viewport, wraps the single rotation `<g>` group (CompassRing + ScaleRing + HexagramRing), the fixed pointer path, and the center TaijiSymbol. Manages position/scale transitions between idle and reading states.
- `CompassRing.vue` — the rotatable disc face with palace-name labels and 8-sector divider lines. Handles pointer-drag and touch-gesture rotation, inertial decay, and snap-to-palace logic. Communicates with the composable state machine.
- `ScaleRing.vue` — decorative ring with the 24 节气 (solar terms) positioned around the outer edge, drawn as tick marks and Chinese labels.
- `HexagramRing.vue` — renders all 64 hexagrams as a ring of `HexagramGlyph` instances, positioned by palace ordering. Each glyph is clickable in idle mode for browsing.
- `HexagramGlyph.vue` — pure SVG `<g>` rendering of a single hexagram's six lines (yao), stacked vertically. Handles the bottom-up to top-down display reversal.

**Scroll result components** (`src/components/scroll/`):
- `ResultScroll.vue` — the sliding scroll panel that appears in reading state, containing a `ScrollContent` instance for the cast hexagram and any browsed hexagram.
- `ScrollContent.vue` — renders hexagram name, trigram composition, divination text (卦辞), and individual line interpretations (爻辞) in a traditional scroll aesthetic. Accepts direction for hexagram-description rendering.

**Legacy hexagram components** (`src/components/hexagram/`):
- `TaijiSymbol.vue` — yin-yang symbol SVG. Still in use (rendered at the compass center).
- `TrigramSymbol.vue`, `HexagramSymbol.vue`, `HexagramRelationship.vue` — remaining on disk but currently unused (dead code from the pre-redesign architecture).

All props via plain `defineProps`.

## Project rules

`/.roo/rules/*.md` (mirrored as `.mdc`) encode the team conventions; follow them: Vue 3 Composition API with `<script setup>`; `ref`/`reactive`/`computed` for state; TypeScript for type safety with proper props/emits; single-responsibility components; ESLint + Prettier formatting enforced; use Vite idioms.
