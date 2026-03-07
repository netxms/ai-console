<script setup>
import { ref, watch, nextTick } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['send'])
const text = ref('')
const textarea = ref(null)

function handleSend() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  text.value = ''
  nextTick(() => focus())
}

function focus() {
  const el = textarea.value?.$el
  if (el) el.focus()
}

watch(() => props.disabled, (val, oldVal) => {
  if (oldVal && !val) {
    nextTick(() => setTimeout(focus, 50))
  }
})

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chat-input-bar">
    <Textarea
      ref="textarea"
      v-model="text"
      placeholder="Ask about your infrastructure..."
      :disabled="disabled"
      auto-resize
      :rows="1"
      class="chat-textarea"
      @keydown="handleKeydown"
    />
    <Button
      icon="pi pi-send"
      :disabled="disabled || !text.trim()"
      rounded
      @click="handleSend"
    />
  </div>
</template>

<style>
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--p-surface-border);
  background: var(--p-surface-card);
}

.chat-textarea {
  flex: 1;
  max-height: 150px;
  resize: none;
}
</style>
