<template>
  <header class="app-header">
    <h1 class="brand">易经占卜</h1>
    <button class="help-btn" type="button" @click="$emit('open-help')">
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <path d="M8 8.2a2 2 0 1 1 2.6 1.9c-.7.3-1.6 1-1.6 1.9V12" stroke-linecap="round" />
        <circle cx="10" cy="14.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      如何起卦
    </button>
  </header>
</template>

<script setup lang="ts">
defineEmits(['open-help'])
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  flex: none;
}
.brand {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 28px;
  margin: 0;
  color: var(--deep-ink);
  letter-spacing: 0.08em;
}
.help-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  color: var(--ink-light);
  background: none;
  border: 1px solid var(--gold);
  border-radius: 999px;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}
.help-btn:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.06);
}
</style>
