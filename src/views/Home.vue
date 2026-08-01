<template>
  <div class="home-page" :class="`state-${state}`">
    <AppHeader @open-help="showHelp = true" />
    <main class="compass-stage">
      <CompassCore />
    </main>
    <CastBar v-if="state !== 'reading' && state !== 'browse'" />

    <HowToOverlay v-if="showHelp" @close="showHelp = false" />
    <HexagramDetailPanel v-if="selectedHexagram" />
    <HexagramLibrary v-if="state === 'browse'" />
    <ResultScroll v-if="state === 'reading'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import CastBar from '../components/layout/CastBar.vue'
import HowToOverlay from '../components/layout/HowToOverlay.vue'
import CompassCore from '../components/compass/CompassCore.vue'
import HexagramDetailPanel from '../components/compass/HexagramDetailPanel.vue'
import HexagramLibrary from '../components/compass/HexagramLibrary.vue'
import ResultScroll from '../components/scroll/ResultScroll.vue'
import { useCompass } from '../composables/useCompass'

const { state, selectedHexagram } = useCompass()
const showHelp = ref(false)
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--paper);
  position: relative;
  overflow: hidden;
}
.compass-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 阅读态：CastBar 隐藏、罗盘 fixed 左上角，页面恢复块布局承载卷轴 */
.home-page.state-reading {
  display: block;
}
</style>
