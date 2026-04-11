<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  content: { type: String, required: true },
})

const html = computed(() => {
  const raw = marked.parse(props.content || '', { breaks: true, gfm: true })
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'a', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'span', 'div', 'hr', 'del', 'sup', 'sub', 'dd', 'dt', 'dl',
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
  })
})
</script>

<template>
  <div class="text-block" v-html="html" />
</template>

<style>
.text-block {
  padding: 0.625rem 0.875rem;
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 2px 12px 12px 12px;
  line-height: 1.55;
  word-break: break-word;
}

.text-block p {
  margin: 0 0 0.5em;
}

.text-block p:last-child {
  margin-bottom: 0;
}

.text-block code {
  background: var(--p-surface-hover);
  padding: 0.125em 0.375em;
  border-radius: 4px;
  font-size: 0.9em;
}

.text-block pre {
  background: var(--p-surface-hover);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.text-block pre code {
  background: none;
  padding: 0;
}
</style>
