<template>
  <div class="help" role="dialog" aria-label="操作手册">
    <header class="help-header">
      <h1 class="help-title">操作手册</h1>
      <button
        class="help-close"
        type="button"
        aria-label="关闭"
        @click="$emit('close')"
      >
        ×
      </button>
    </header>

    <nav class="help-nav" aria-label="章节导航">
      <button
        v-for="c in GUIDE"
        :key="c.id"
        type="button"
        class="help-chip"
        @click="scrollToSection(c.id)"
      >
        {{ c.title }}
      </button>
    </nav>

    <div class="help-body">
      <section v-for="c in GUIDE" :id="c.id" :key="c.id" class="guide-chapter">
        <h2 class="guide-title">{{ c.title }}</h2>

        <template v-for="(b, i) in c.blocks" :key="i">
          <p v-if="b.type === 'para'" class="gb-para">{{ b.text }}</p>

          <ul v-else-if="b.type === 'list'" class="gb-list">
            <li v-for="(it, j) in b.items" :key="j">{{ it }}</li>
          </ul>

          <template v-else-if="b.type === 'steps'">
            <h3 class="gb-title">{{ b.title }}</h3>
            <ol class="gb-steps">
              <li v-for="(s, j) in b.steps" :key="j">{{ s }}</li>
            </ol>
          </template>

          <template v-else-if="b.type === 'terms'">
            <h3 class="gb-title">{{ b.title }}</h3>
            <dl class="gb-terms">
              <template v-for="(t, j) in b.items" :key="j">
                <dt>{{ t.k }}</dt>
                <dd>{{ t.v }}</dd>
              </template>
            </dl>
          </template>

          <template v-else-if="b.type === 'table'">
            <h3 class="gb-title">{{ b.title }}</h3>
            <div class="gb-table-wrap">
              <table class="gb-table">
                <thead>
                  <tr>
                    <th v-for="(h, j) in b.head" :key="j">{{ h }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, j) in b.rows" :key="j">
                    <td v-for="(cell, k) in row" :key="k">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <p v-else-if="b.type === 'note'" class="gb-note">{{ b.text }}</p>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { GUIDE } from '@/data/helpContent';

defineEmits(['close']);
const props = defineProps({
  initialSection: { type: String, default: '' },
});

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

onMounted(() => {
  if (props.initialSection) {
    nextTick(() => scrollToSection(props.initialSection));
  }
});
</script>

<style scoped>
.help {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--paper);
  display: flex;
  flex-direction: column;
}
.help-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--gold);
  background: var(--scroll);
}
.help-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--deep-ink);
  margin: 0;
  letter-spacing: 0.12em;
}
.help-close {
  width: 40px;
  height: 40px;
  font-size: 26px;
  line-height: 1;
  color: var(--ink-light);
  background: none;
  border: none;
  border-radius: 50%;
}
.help-close:hover {
  color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.08);
}
.help-nav {
  flex: none;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 20px;
  border-bottom: 1px solid var(--gold-light);
  background: var(--paper);
}
.help-chip {
  flex: none;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--ink-light);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}
.help-chip:hover {
  color: #faf3e8;
  background: var(--cinnabar);
  border-color: var(--cinnabar);
}
.help-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 60px;
}
.guide-chapter {
  max-width: 760px;
  margin: 0 auto 36px;
  scroll-margin-top: 12px;
}
.guide-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 24px;
  color: var(--cinnabar);
  letter-spacing: 0.12em;
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 8px;
  margin: 0 0 14px;
}
.gb-title {
  font-size: 15px;
  color: var(--ink);
  letter-spacing: 0.08em;
  margin: 20px 0 8px;
}
.gb-para {
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink);
  margin: 0 0 10px;
}
.gb-list {
  margin: 0 0 10px;
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink);
}
.gb-steps {
  margin: 0 0 10px;
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink);
}
.gb-steps li {
  margin-bottom: 6px;
}
.gb-terms {
  margin: 0 0 10px;
  border: 1px solid var(--gold-light);
  border-radius: 8px;
  background: var(--scroll);
  padding: 10px 16px;
}
.gb-terms dt {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 17px;
  color: var(--cinnabar);
  margin-top: 10px;
}
.gb-terms dt:first-child {
  margin-top: 0;
}
.gb-terms dd {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
}
.gb-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--gold-light);
  border-radius: 8px;
  background: var(--scroll);
  margin-bottom: 10px;
}
.gb-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--ink);
  min-width: 420px;
}
.gb-table th,
.gb-table td {
  padding: 7px 10px;
  border-bottom: 1px dotted var(--gold-light);
  text-align: left;
  line-height: 1.6;
}
.gb-table th {
  color: var(--ink-light);
  font-weight: normal;
  font-size: 12px;
  letter-spacing: 0.1em;
  background: rgba(168, 135, 58, 0.08);
  white-space: nowrap;
}
.gb-table tbody tr:last-child td {
  border-bottom: none;
}
.gb-note {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink);
  border-left: 4px solid var(--gold);
  border-radius: 0 8px 8px 0;
  background: rgba(168, 135, 58, 0.1);
  padding: 10px 14px;
  margin: 0 0 10px;
}

@media (min-width: 900px) {
  .help-nav {
    padding: 10px 32px;
  }
  .help-body {
    padding: 28px 32px 72px;
  }
}
@media (max-width: 600px) {
  .help-nav {
    padding: 8px 12px;
  }
  .help-body {
    padding: 16px 14px 48px;
  }
}
</style>
