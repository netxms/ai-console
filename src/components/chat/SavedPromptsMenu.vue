<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import { useSavedPromptsStore } from '@/stores/savedPromptsStore'

const emit = defineEmits(['select'])

const store = useSavedPromptsStore()
const op = ref(null)
const confirmDeleteId = ref(null)

onMounted(() => {
   if (store.prompts.length === 0 && !store.loading) {
      store.load()
   }
})

function toggle(event) {
   op.value.toggle(event)
}

function selectPrompt(prompt) {
   emit('select', prompt.promptText)
   op.value.hide()
}

async function deletePrompt(id) {
   await store.remove(id)
   confirmDeleteId.value = null
}

defineExpose({ toggle })
</script>

<template>
   <Popover ref="op" class="saved-prompts-popover">
      <div class="saved-prompts-panel">
         <div class="saved-prompts-header">
            <span class="saved-prompts-title">Saved Prompts</span>
         </div>
         <div v-if="store.loading" class="saved-prompts-loading">
            <i class="pi pi-spinner pi-spin" />
            <span>Loading...</span>
         </div>
         <div v-else-if="store.prompts.length === 0" class="saved-prompts-empty">
            No saved prompts yet
         </div>
         <div v-else class="saved-prompts-list">
            <div
               v-for="prompt in store.prompts"
               :key="prompt.id"
               class="saved-prompt-item"
            >
               <div class="saved-prompt-main" @click="selectPrompt(prompt)">
                  <span class="saved-prompt-name">{{ prompt.name }}</span>
                  <span v-if="prompt.description" class="saved-prompt-desc">{{ prompt.description }}</span>
               </div>
               <div class="saved-prompt-actions">
                  <Button
                     v-if="confirmDeleteId === prompt.id"
                     icon="pi pi-check"
                     severity="danger"
                     text
                     size="small"
                     @click.stop="deletePrompt(prompt.id)"
                  />
                  <Button
                     v-else
                     icon="pi pi-trash"
                     severity="secondary"
                     text
                     size="small"
                     @click.stop="confirmDeleteId = prompt.id"
                  />
               </div>
            </div>
         </div>
      </div>
   </Popover>
</template>

<style>
.saved-prompts-panel {
   width: 320px;
   max-height: 400px;
   display: flex;
   flex-direction: column;
}

.saved-prompts-header {
   display: flex;
   align-items: center;
   padding: 0.5rem 0.75rem;
   border-bottom: 1px solid var(--p-surface-border);
}

.saved-prompts-title {
   font-weight: 600;
   font-size: 0.85rem;
}

.saved-prompts-loading,
.saved-prompts-empty {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 0.5rem;
   padding: 1.5rem;
   font-size: 0.85rem;
   color: var(--p-text-muted-color);
}

.saved-prompts-list {
   overflow-y: auto;
   max-height: 340px;
}

.saved-prompt-item {
   display: flex;
   align-items: center;
   border-bottom: 1px solid var(--p-surface-border);
}

.saved-prompt-item:last-child {
   border-bottom: none;
}

.saved-prompt-main {
   flex: 1;
   min-width: 0;
   padding: 0.5rem 0.75rem;
   cursor: pointer;
   display: flex;
   flex-direction: column;
   gap: 0.125rem;
}

.saved-prompt-main:hover {
   background: var(--p-surface-hover);
}

.saved-prompt-name {
   font-size: 0.85rem;
   font-weight: 500;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.saved-prompt-desc {
   font-size: 0.75rem;
   color: var(--p-text-muted-color);
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.saved-prompt-actions {
   flex-shrink: 0;
   padding-right: 0.25rem;
}
</style>
