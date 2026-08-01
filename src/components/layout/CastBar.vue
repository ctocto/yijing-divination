<template>
  <div class="cast-bar">
    <div class="direction-row">
      <label for="cast-direction">所问何事</label>
      <select id="cast-direction" v-model="selectedDirection">
        <option value="">无方向（开放问题）</option>
        <option>事业</option>
        <option>情感</option>
        <option>健康</option>
        <option>学业</option>
        <option>财富</option>
        <option>家庭</option>
        <option value="其他">其他</option>
      </select>
      <input
        v-if="selectedDirection === '其他'"
        v-model="customDirection"
        type="text"
        placeholder="请输入所问之事"
        class="direction-input"
      />
    </div>

    <button
      class="cast-btn"
      type="button"
      :disabled="state !== 'idle'"
      @click="castSpin"
    >静 心 起 卦</button>

    <button class="library-link" type="button" @click="openLibrary">浏览六十四卦 ▸</button>
  </div>
</template>

<script setup lang="ts">
import { useCompass } from '@/composables/useCompass'

const { selectedDirection, customDirection, state, castSpin, openLibrary } = useCompass()
</script>

<style scoped>
.cast-bar {
  position: relative;
  z-index: 20;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 24px 24px;
  background: linear-gradient(to top, var(--paper) 55%, rgba(245, 240, 232, 0));
}
.direction-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--ink-light);
  flex-wrap: wrap;
  justify-content: center;
}
.direction-row select,
.direction-input {
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--gold);
  border-radius: 4px;
  background: var(--scroll);
  color: var(--ink);
}
.direction-input { width: 180px; }
.cast-btn {
  min-width: 220px;
  min-height: 52px;
  padding: 12px 40px;
  font-size: 20px;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  letter-spacing: 0.25em;
  color: var(--scroll);
  background: var(--cinnabar);
  border: none;
  border-radius: 4px;
  box-shadow: 0 4px 14px rgba(178, 58, 46, 0.35);
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}
.cast-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(178, 58, 46, 0.45);
}
.cast-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.library-link {
  font-size: 14px;
  color: var(--ink-light);
  background: none;
  border: none;
  border-bottom: 1px dashed var(--gold);
  padding: 2px 2px;
  letter-spacing: 0.1em;
  transition: color 0.2s;
}
.library-link:hover { color: var(--cinnabar); }
</style>
