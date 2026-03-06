<script setup>
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import PendingQuestion from './PendingQuestion.vue'
import { useAiChatStore } from '@/stores/aiChatStore'

const chatStore = useAiChatStore()

function handleSend(text) {
  chatStore.sendMessage(text)
}
</script>

<template>
  <div class="chat-panel">
    <MessageList
      :messages="chatStore.messages"
      :processing="chatStore.processing"
      class="chat-messages"
    />
    <PendingQuestion
      v-if="chatStore.pendingQuestion"
      :question="chatStore.pendingQuestion"
      @answer="(positive, option) => chatStore.answerQuestion(positive, option)"
    />
    <ChatInput
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
</style>
