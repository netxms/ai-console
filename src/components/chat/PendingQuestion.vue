<script setup>
import Button from 'primevue/button'
import { t } from '@/i18n'

const props = defineProps({
  question: { type: Object, required: true },
})

const emit = defineEmits(['answer'])

function handleOption(index) {
  emit('answer', true, index)
}
</script>

<template>
  <div class="pending-question">
    <div class="question-text">{{ question.text }}</div>
    <p v-if="question.context" class="question-context">{{ question.context }}</p>

    <div v-if="question.type === 'multipleChoice' && question.options" class="question-options">
      <Button
        v-for="(opt, i) in question.options"
        :key="i"
        :label="opt"
        severity="secondary"
        outlined
        size="small"
        @click="handleOption(i)"
      />
    </div>

    <div v-else class="question-actions">
      <Button
        :label="question.confirmationType === 1 ? t('question.yes') : t('question.approve')"
        size="small"
        @click="emit('answer', true)"
      />
      <Button
        :label="question.confirmationType === 1 ? t('question.no') : t('question.reject')"
        severity="secondary"
        outlined
        size="small"
        @click="emit('answer', false)"
      />
    </div>
  </div>
</template>

<style>
.pending-question {
  margin: 0 1rem;
  padding: 0.75rem 1rem;
  background: var(--p-surface-card);
  border: 1px solid var(--p-primary-color);
  border-radius: 8px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.question-context {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.question-options,
.question-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
