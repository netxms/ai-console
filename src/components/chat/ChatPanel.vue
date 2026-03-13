<script setup>
import { ref, watch, nextTick } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import PendingQuestion from './PendingQuestion.vue'
import { useAiChatStore } from '@/stores/aiChatStore'

const chatStore = useAiChatStore()
const chatInput = ref(null)

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
</style>
