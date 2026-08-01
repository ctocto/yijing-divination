<template>
  <div class="result-scroll">
    <div class="scroll-sheet">
      <ScrollContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScrollContent from './ScrollContent.vue'
</script>

<style scoped>
.result-scroll {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px;
}
.scroll-sheet {
  width: 100%;
  max-width: 640px;
  max-height: 92vh;
  overflow-y: auto;
  background: var(--scroll);
  border-radius: 6px;
  border-left: 10px solid #d4c5a0;
  border-right: 10px solid #d4c5a0;
  box-shadow: 0 8px 40px rgba(44, 36, 22, 0.25);
  padding: 48px 56px 56px;
  animation: scroll-unfold 0.8s ease-out;
}
@media (max-width: 600px) {
  .result-scroll {
    padding: 16px;
  }
  .scroll-sheet {
    padding: 32px 20px 44px;
    border-left-width: 6px;
    border-right-width: 6px;
  }
}
@keyframes scroll-unfold {
  from {
    clip-path: inset(0 0 100% 0);
    opacity: 0.4;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
</style>
