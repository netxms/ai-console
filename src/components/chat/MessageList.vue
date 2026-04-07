<script setup>
import { ref, watch, nextTick } from 'vue'
import UserMessage from './UserMessage.vue'
import AssistantMessage from './AssistantMessage.vue'
import ProcessingIndicator from './ProcessingIndicator.vue'
import { brand } from '@/brands'
import { useAiChatStore } from '@/stores/aiChatStore'

const chatStore = useAiChatStore()

const props = defineProps({
  messages: { type: Array, required: true },
  processing: { type: Boolean, default: false },
  currentFunction: { type: String, default: null },
})

const container = ref(null)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  },
)
</script>

<template>
  <div ref="container" class="message-list">
    <div v-if="messages.length === 0" class="empty-state">
      <i class="pi pi-sparkles empty-icon" />
      <p class="empty-title">{{ brand.name }} {{ brand.title }}</p>
      <p class="empty-hint">
        {{ chatStore.contextObject
          ? `Ask about ${chatStore.contextObject.object_name || 'this object'}...`
          : 'Ask anything about your infrastructure' }}
      </p>
    </div>

    <template v-for="(msg, i) in messages" :key="i">
      <UserMessage v-if="msg.role === 'user'" :content="msg.content" :timestamp="msg.timestamp" />
      <AssistantMessage
        v-else
        :blocks="msg.blocks"
        :is-error="msg.isError"
        :timestamp="msg.timestamp"
      />
    </template>

    <ProcessingIndicator v-if="processing" :function-name="currentFunction" />
  </div>
</template>

<style>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 300px;
  color: var(--p-text-muted-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--p-primary-color);
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.empty-hint {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
}
</style>
