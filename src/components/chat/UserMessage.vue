<script setup>
import { computed } from 'vue'
import { formatTime } from '@/i18n'

const props = defineProps({
  content: { type: String, required: true },
  timestamp: { type: Number, default: 0 },
})

const timeLabel = computed(() => {
  if (!props.timestamp) return ''
  return formatTime(props.timestamp)
})
</script>

<template>
  <div class="user-message">
    <div class="user-bubble">
      <div dir="auto">{{ content }}</div>
      <span v-if="timeLabel" class="msg-time">{{ timeLabel }}</span>
    </div>
    <div class="user-avatar">
      <i class="pi pi-user" />
    </div>
  </div>
</template>

<style>
.user-message {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  align-items: flex-start;
}

.user-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--p-primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-top: 2px;
}

.user-bubble {
  max-width: 80%;
  padding: 0.625rem 0.875rem;
  background: var(--surface-2);
  color: var(--text-primary);
  border-radius: 12px;
  border-end-end-radius: 2px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
  position: relative;
}

.user-bubble .msg-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.7;
  text-align: end;
  margin-top: 0.25rem;
}
</style>
