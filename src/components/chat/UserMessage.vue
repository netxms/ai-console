<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, required: true },
  timestamp: { type: Number, default: 0 },
})

const timeLabel = computed(() => {
  if (!props.timestamp) return ''
  const d = new Date(props.timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="user-message">
    <div class="user-bubble">
      {{ content }}
      <span v-if="timeLabel" class="msg-time">{{ timeLabel }}</span>
    </div>
  </div>
</template>

<style>
.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  max-width: 80%;
  padding: 0.625rem 0.875rem;
  background: var(--surface-2);
  color: var(--text-primary);
  border-radius: 12px 12px 2px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
  position: relative;
}

.user-bubble .msg-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 0.25rem;
}
</style>
