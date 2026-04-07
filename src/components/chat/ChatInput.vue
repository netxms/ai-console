<script setup>
import { ref, watch, nextTick } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import SavedPromptsMenu from './SavedPromptsMenu.vue'
import SavePromptDialog from './SavePromptDialog.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['send'])
const text = ref('')
const textarea = ref(null)
const savedPromptsMenu = ref(null)
const showSaveDialog = ref(false)
const savePromptText = ref('')

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

defineExpose({ focus })

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSelectPrompt(promptText) {
  text.value = promptText
  nextTick(() => focus())
}

function handleSavePrompt() {
  savePromptText.value = text.value.trim()
  showSaveDialog.value = true
}
</script>

<template>
  <div class="chat-input-bar">
    <div class="chat-input-actions">
      <Button
        icon="pi pi-bookmark"
        severity="secondary"
        text
        size="small"
        v-tooltip.top="'Saved prompts'"
        @click="savedPromptsMenu.toggle($event)"
      />
      <Button
        v-if="text.trim()"
        icon="pi pi-save"
        severity="secondary"
        text
        size="small"
        v-tooltip.top="'Save prompt'"
        @click="handleSavePrompt"
      />
    </div>
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
    <SavedPromptsMenu ref="savedPromptsMenu" @select="handleSelectPrompt" />
    <SavePromptDialog v-model:visible="showSaveDialog" :prompt-text="savePromptText" />
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

.chat-input-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  align-self: flex-end;
  padding-bottom: 0.125rem;
}

.chat-textarea {
  flex: 1;
  max-height: 150px;
  resize: none;
}
</style>
