<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="assistant-layout">
    <AppHeader class="layout-header" />
    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<style>
.assistant-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-header {
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  overflow: hidden;
}
</style>
