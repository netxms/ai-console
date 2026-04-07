<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useSavedPromptsStore } from '@/stores/savedPromptsStore'

const props = defineProps({
   visible: { type: Boolean, default: false },
   promptText: { type: String, default: '' },
})

const emit = defineEmits(['update:visible'])

const store = useSavedPromptsStore()
const name = ref('')
const description = ref('')
const saving = ref(false)
const error = ref(null)

watch(() => props.visible, (val) => {
   if (val) {
      name.value = ''
      description.value = ''
      error.value = null
   }
})

async function save() {
   if (!name.value.trim() || !props.promptText.trim()) return
   saving.value = true
   error.value = null
   try {
      await store.add({
         name: name.value.trim(),
         promptText: props.promptText.trim(),
         description: description.value.trim() || undefined,
      })
      emit('update:visible', false)
   } catch (err) {
      error.value = err.message
   } finally {
      saving.value = false
   }
}
</script>

<template>
   <Dialog
      :visible="visible"
      @update:visible="emit('update:visible', $event)"
      header="Save Prompt"
      :modal="true"
      :style="{ width: '28rem' }"
   >
      <div class="save-prompt-form">
         <div class="save-prompt-field">
            <label>Name</label>
            <InputText v-model="name" placeholder="e.g. Top busy interfaces" class="save-prompt-input" />
         </div>
         <div class="save-prompt-field">
            <label>Description (optional)</label>
            <InputText v-model="description" placeholder="Brief description" class="save-prompt-input" />
         </div>
         <div class="save-prompt-field">
            <label>Prompt</label>
            <Textarea :model-value="promptText" disabled auto-resize :rows="2" class="save-prompt-input" />
         </div>
         <small v-if="error" class="save-prompt-error">{{ error }}</small>
      </div>
      <template #footer>
         <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
         <Button label="Save" :disabled="!name.trim() || saving" :loading="saving" @click="save" />
      </template>
   </Dialog>
</template>

<style>
.save-prompt-form {
   display: flex;
   flex-direction: column;
   gap: 0.75rem;
}

.save-prompt-field {
   display: flex;
   flex-direction: column;
   gap: 0.25rem;
}

.save-prompt-field label {
   font-size: 0.8rem;
   font-weight: 500;
   color: var(--p-text-muted-color);
}

.save-prompt-input {
   width: 100%;
}

.save-prompt-error {
   color: var(--p-red-500);
}
</style>
