<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useAuthStore } from '@/stores/authStore'
import { useAiChatStore } from '@/stores/aiChatStore'
import { useVisualizationStore } from '@/stores/visualizationStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
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
        <i class="pi pi-sparkles" />
        NetXMS AI Console
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
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title {
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}
</style>
