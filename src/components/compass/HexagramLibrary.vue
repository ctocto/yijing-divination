<template>
  <div class="library" role="dialog" aria-label="六十四卦">
    <header class="library-header">
      <h1 class="library-title">六十四卦</h1>
      <button class="library-back" type="button" @click="$emit('close')">← 返回</button>
    </header>
    <div class="library-body">
      <section v-for="palace in palaces" :key="palace.name" class="palace-group">
        <h2 class="palace-label">{{ palace.name }}</h2>
        <div class="palace-grid">
          <button
            v-for="name in palace.hexagrams"
            :key="name"
            type="button"
            class="hex-cell"
            :class="{ selected: selectedName === name }"
            @click="onCellClick(name)"
          >
            <span class="cell-name">{{ name }}</span>
            <svg class="cell-glyph" viewBox="0 0 34 26" width="34" height="26" aria-hidden="true">
              <g v-for="(line, i) in linesOf(name)" :key="i" :transform="`translate(0, ${i * 4.4})`">
                <rect v-if="line === '1'" x="0" y="0" width="16" height="2.4" rx="1.2" class="cell-line" />
                <g v-else>
                  <rect x="0" y="0" width="6.5" height="2.4" rx="1.2" class="cell-line" />
                  <rect x="9.5" y="0" width="6.5" height="2.4" rx="1.2" class="cell-line" />
                </g>
              </g>
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { palaces } from '@/data/palaces'
import { hexagrams } from '@/data/hexagrams'
import { useCompass } from '@/composables/useCompass'

defineEmits(['close'])

const { selectedHexagram, selectHexagram, clearSelection } = useCompass()
const selectedName = computed(() => selectedHexagram.value?.name || '')

function hexagramByName(name) {
  return hexagrams.find(h => h.name === name)
}
function linesOf(name) {
  return hexagramByName(name)?.binary.split('').reverse() || []
}
function onCellClick(name) {
  const h = hexagramByName(name)
  if (!h) return
  if (selectedName.value === name) clearSelection()
  else selectHexagram(h)
}
</script>

<style scoped>
.library {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: var(--paper);
  display: flex;
  flex-direction: column;
}
.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--gold);
  flex: none;
}
.library-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--deep-ink);
  margin: 0;
}
.library-back {
  padding: 8px 16px;
  font-size: 15px;
  color: var(--ink-light);
  background: none;
  border: 1px solid var(--gold);
  border-radius: 4px;
  transition: color 0.2s, border-color 0.2s;
}
.library-back:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
}
.library-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 48px;
}
.palace-group { margin-bottom: 28px; }
.palace-label {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 20px;
  color: var(--cinnabar);
  margin: 0 0 12px;
  letter-spacing: 0.12em;
}
.palace-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}
.hex-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  min-height: 72px;
  background: var(--scroll);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  transition: border-color 0.2s, background-color 0.2s, transform 0.15s;
}
.hex-cell:hover {
  border-color: var(--gold);
  background: #fffdf6;
  transform: translateY(-2px);
}
.hex-cell.selected {
  border-color: var(--cinnabar);
  background: #f6e3df;
}
.cell-name {
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
}
.cell-line { fill: var(--ink); }
.hex-cell.selected .cell-name,
.hex-cell.selected .cell-line { fill: var(--cinnabar); }

@media (max-width: 900px) {
  .palace-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 600px) {
  .palace-grid { grid-template-columns: repeat(3, 1fr); }
  .library-body { padding: 16px 16px 40px; }
}
</style>
