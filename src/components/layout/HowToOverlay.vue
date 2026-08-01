<template>
  <div class="howto-mask" @click.self="$emit('close')">
    <div class="howto-card" role="dialog" aria-modal="true" aria-label="如何起卦">
      <h2 class="howto-title">如何起卦</h2>
      <ol class="howto-list">
        <li><b>转动罗盘</b>——按住盘面拖动，松手后自动出卦。</li>
        <li><b>静心起卦</b>——点击下方朱砂按钮，罗盘自动旋转出卦。</li>
        <li><b>浏览卦象</b>——点击盘上卦符，或「浏览六十四卦」查看全部卦辞爻辞。</li>
      </ol>
      <button class="howto-close" type="button" @click="$emit('close')">知道了</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.howto-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 23, 18, 0.45);
  padding: 24px;
}
.howto-card {
  width: 100%;
  max-width: 420px;
  background: var(--scroll);
  border-radius: 8px;
  border: 1px solid var(--gold);
  box-shadow: 0 16px 48px rgba(26, 23, 18, 0.35);
  padding: 32px 36px 28px;
  animation: howto-in 0.25s ease-out;
}
.howto-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--cinnabar);
  text-align: center;
  margin: 0 0 20px;
}
.howto-list {
  margin: 0 0 24px;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink);
}
.howto-list li + li { margin-top: 8px; }
.howto-close {
  display: block;
  margin: 0 auto;
  padding: 9px 32px;
  font-size: 15px;
  letter-spacing: 0.2em;
  color: var(--scroll);
  background: var(--cinnabar);
  border: none;
  border-radius: 4px;
  transition: transform 0.15s, box-shadow 0.2s;
}
.howto-close:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 14px rgba(178, 58, 46, 0.4);
}
@keyframes howto-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
