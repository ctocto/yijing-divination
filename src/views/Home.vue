<template>
  <div class="compass-page" :class="`state-${state}`">
    <CompassCore />
    <ResultScroll v-if="state === 'reading'" />
  </div>
</template>

<script setup lang="ts">
import CompassCore from '../components/compass/CompassCore.vue'
import ResultScroll from '../components/scroll/ResultScroll.vue'
import { useCompass } from '../composables/useCompass'

const { state } = useCompass()
</script>

<style scoped>
.compass-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--paper);
  position: relative;
  overflow: hidden;
}
.compass-page.state-reading {
  display: block;
}
</style>
