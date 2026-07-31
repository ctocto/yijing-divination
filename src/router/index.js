// 导入 Vue 和 Vue Router
import { createRouter, createWebHistory } from 'vue-router';

// 定义路由 —— 单页应用，罗盘承载全部功能
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
