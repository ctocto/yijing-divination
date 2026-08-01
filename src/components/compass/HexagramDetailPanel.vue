<template>
  <div class="panel-backdrop" @click.self="clearSelection">
    <aside class="detail-panel" role="dialog" aria-label="卦象详情">
      <button class="panel-close" type="button" aria-label="关闭" @click="clearSelection">×</button>
      <h2 class="panel-name">{{ hexagram?.name }}</h2>
      <p class="panel-palace">{{ palaceName }}</p>
      <h3 class="panel-section-title">卦辞</h3>
      <p class="panel-text">{{ hexagram?.text }}</p>
      <h3 class="panel-section-title">爻辞</h3>
      <ul class="panel-lines">
        <li v-for="(line, i) in hexagram?.lines || []" :key="i" class="panel-line">
          <span class="dot" />{{ line }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompass } from '@/composables/useCompass'
import { palaces } from '@/data/palaces'

const { selectedHexagram, clearSelection } = useCompass()

const hexagram = computed(() => selectedHexagram.value)
const palaceName = computed(() => {
  if (!hexagram.value) return ''
  const p = palaces.find(pal => pal.hexagrams.includes(hexagram.value.name))
  return p ? p.name : ''
})
</script>

<style scoped>
.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(26, 23, 18, 0.28);
}
.detail-panel {
  position: relative;
  width: min(400px, 92vw);
  height: 100%;
  background: var(--scroll);
  border-left: 8px solid #d4c5a0;
  box-shadow: -8px 0 32px rgba(26, 23, 18, 0.2);
  padding: 40px 36px;
  overflow-y: auto;
  animation: panel-in 0.28s ease-out;
}
.panel-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 40px;
  height: 40px;
  font-size: 24px;
  line-height: 1;
  color: var(--ink-light);
  background: none;
  border: none;
  border-radius: 50%;
  transition: color 0.2s, background-color 0.2s;
}
.panel-close:hover {
  color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.08);
}
.panel-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 40px;
  color: var(--cinnabar);
  margin: 0 0 4px;
}
.panel-palace {
  font-size: 13px;
  color: var(--ink-light);
  margin: 0 0 20px;
  letter-spacing: 0.1em;
}
.panel-section-title {
  font-size: 15px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  margin: 0 0 10px;
  letter-spacing: 0.12em;
}
.panel-text {
  font-size: 16px;
  line-height: 1.9;
  color: var(--ink);
  margin: 0 0 24px;
}
.panel-lines {
  list-style: none;
  margin: 0;
  padding: 0;
}
.panel-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
  margin: 8px 0;
}
.dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cinnabar);
  align-self: center;
}
@keyframes panel-in {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@media (max-width: 600px) {
  .detail-panel { padding: 28px 22px; }
}
</style>
