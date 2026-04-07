<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import PendingQuestion from './PendingQuestion.vue'
import { useAiChatStore } from '@/stores/aiChatStore'

const chatStore = useAiChatStore()
const chatInput = ref(null)
const contextObject = computed(() => chatStore.contextObject)

watch(() => chatStore.messages.length, (len, oldLen) => {
  if (len === 0 && oldLen !== 0) {
    nextTick(() => chatInput.value?.focus())
  }
})

function handleSend(text) {
  chatStore.sendMessage(text)
}
</script>

<template>
  <div class="chat-panel">
    <div v-if="contextObject" class="context-bar">
      <i class="pi pi-link" />
      <span class="context-label">{{ contextObject.object_name || `Object #${contextObject.object_id}` }}</span>
      <button class="context-clear" @click="chatStore.clearContext()">
        <i class="pi pi-times" />
      </button>
    </div>
    <MessageList
      :messages="chatStore.messages"
      :processing="chatStore.processing"
      :current-function="chatStore.currentFunction"
      class="chat-messages"
    />
    <PendingQuestion
      v-if="chatStore.pendingQuestion"
      :question="chatStore.pendingQuestion"
      @answer="(positive, option) => chatStore.answerQuestion(positive, option)"
    />
    <ChatInput
      ref="chatInput"
      :disabled="chatStore.processing"
      class="chat-input"
      @send="handleSend"
    />
  </div>
</template>

<style>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
}

.chat-input {
  flex-shrink: 0;
}

.context-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}

.context-bar .pi-link {
  font-size: 0.75rem;
}

.context-label {
  font-weight: 500;
  color: var(--p-text-color);
}

.context-clear {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: var(--p-text-muted-color);
  font-size: 0.7rem;
  display: flex;
}

.context-clear:hover {
  background: var(--p-surface-border);
  color: var(--p-text-color);
}
</style>
