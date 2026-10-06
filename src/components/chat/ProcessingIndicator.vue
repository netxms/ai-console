<script setup>
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/localeStore'
import { t } from '@/i18n'

const localeStore = useLocaleStore()

const props = defineProps({
  functionName: { type: String, default: null },
})

// English only: other languages cannot derive a phrase from the function name
const progressiveVerbs = [
  ['get ', 'Getting'],
  ['read ', 'Reading'],
  ['find ', 'Finding'],
  ['list ', 'Listing'],
  ['search ', 'Searching'],
  ['analyze ', 'Analyzing'],
  ['explain ', 'Explaining'],
  ['query ', 'Querying'],
  ['check ', 'Checking'],
  ['create ', 'Creating'],
  ['update ', 'Updating'],
  ['delete ', 'Deleting'],
  ['send ', 'Sending'],
  ['load ', 'Loading'],
]

const functionLabel = computed(() => {
  if (!props.functionName) return null
  const readable = props.functionName.replace(/[-_]/g, ' ')
  if (localeStore.locale !== 'en') return t('chat.runningFunction', { name: readable })
  const lower = readable.toLowerCase()
  for (const [prefix, progressive] of progressiveVerbs) {
    if (lower.startsWith(prefix)) {
      return progressive + readable.substring(prefix.length - 1)
    }
  }
  return readable.charAt(0).toUpperCase() + readable.substring(1)
})
</script>

<template>
  <div class="processing-indicator">
    <div class="assistant-avatar">
      <i class="pi pi-sparkles" />
    </div>
    <div class="processing-content">
      <div class="dots">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>
      <span v-if="functionLabel" class="function-label">{{ functionLabel }}...</span>
    </div>
  </div>
</template>

<style>
.processing-indicator {
  display: flex;
  gap: 0.625rem;
  align-items: center;
}

.processing-indicator .assistant-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sem-info);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.dots {
  display: flex;
  gap: 4px;
  padding: 0.625rem 0.875rem;
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 12px;
  border-start-start-radius: 2px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-text-muted-color);
  animation: dot-bounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.function-label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  font-style: italic;
}
</style>
