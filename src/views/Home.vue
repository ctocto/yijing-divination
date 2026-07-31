<template>
  <div class="home">
    <hexagram-chart @click="navigateToDivination" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import HexagramChart from '../components/HexagramChart.vue';

const router = useRouter();

function navigateToDivination() {
  router.push('/divination');
}
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'SimSun', 'STSong', serif;
}
</style>
