<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useAuthStore } from '@/stores/authStore'
import { useAiChatStore } from '@/stores/aiChatStore'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { useThemeStore } from '@/stores/themeStore'
import { useRouter } from 'vue-router'
import { brand } from '@/brands'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const chatStore = useAiChatStore()
const vizStore = useVisualizationStore()
const router = useRouter()

const showConfirm = ref(false)

function handleNewChat() {
  if (chatStore.messages.length > 0) {
    showConfirm.value = true
  } else {
    doNewChat()
  }
}

function doNewChat() {
  showConfirm.value = false
  chatStore.newSession()
  vizStore.clear()
}

function handleLogout() {
  chatStore.newSession()
  vizStore.clear()
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <span class="header-title">
        <img :src="brand.icon" :alt="brand.name" class="header-logo" />
        {{ brand.title }}
      </span>
    </div>
    <div class="header-right">
      <Button
        label="New Chat"
        icon="pi pi-plus"
        severity="secondary"
        text
        size="small"
        @click="handleNewChat"
      />
      <Button
        :icon="themeStore.dark ? 'pi pi-sun' : 'pi pi-moon'"
        severity="secondary"
        text
        size="small"
        v-tooltip.bottom="themeStore.dark ? 'Light mode' : 'Dark mode'"
        @click="themeStore.toggle()"
      />
      <span class="user-name">{{ authStore.user?.username }}</span>
      <Button
        icon="pi pi-sign-out"
        severity="secondary"
        text
        size="small"
        v-tooltip.bottom="'Logout'"
        @click="handleLogout"
      />
    </div>

    <Dialog
      v-model:visible="showConfirm"
      header="New Chat"
      :modal="true"
      :style="{ width: '24rem' }"
    >
      <p style="margin: 0;">Start a new chat? Current conversation will be cleared.</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="showConfirm = false" />
        <Button label="New Chat" severity="danger" @click="doNewChat" />
      </template>
    </Dialog>
  </header>
</template>

<style>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 1rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-logo {
  height: 24px;
  width: auto;
}

.header-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-right .p-button {
  color: var(--text-secondary);
}

.header-right .p-button:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.06);
}

.user-name {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
