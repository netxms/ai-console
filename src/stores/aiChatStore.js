import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as aiChatApi from '@/api/aiChatApi'
import { parseResponse } from '@/utils/parseResponse'
import { t } from '@/i18n'

export const useAiChatStore = defineStore('aiChat', () => {
  const chatId = ref(null)
  const messages = ref([])
  const processing = ref(false)
  const currentFunction = ref(null)
  const error = ref(null)
  const pendingQuestion = ref(null)
  const contextObject = ref(null)
  const contextSent = ref(false)

  let pollTimer = null

  const hasChat = computed(() => chatId.value !== null)

  async function createSession() {
    error.value = null
    try {
      const data = await aiChatApi.createChat()
      chatId.value = data.chatId
      messages.value = []
      return data.chatId
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function sendMessage(text) {
    processing.value = true
    currentFunction.value = null
    error.value = null
    pendingQuestion.value = null

    try {
      if (!chatId.value) await createSession()
      messages.value.push({ role: 'user', content: text, timestamp: Date.now() })
      const context = (!contextSent.value && contextObject.value) ? contextObject.value : null
      await aiChatApi.sendMessage(chatId.value, text, context)
      if (context) contextSent.value = true
      await pollForResponse()
    } catch (err) {
      processing.value = false
      currentFunction.value = null
      error.value = err.message
      messages.value.push({
        role: 'assistant',
        blocks: [{ type: 'text', content: t('chat.error', { message: err.message }) }],
        isError: true,
        timestamp: Date.now(),
      })
    }
  }

  async function pollForResponse() {
    stopPolling()

    const poll = async () => {
      try {
        const data = await aiChatApi.getStatus(chatId.value)

        if (data.status === 'completed') {
          processing.value = false
          currentFunction.value = null
          pendingQuestion.value = null
          if (data.errorMessage) {
            error.value = data.errorMessage
            messages.value.push({
              role: 'assistant',
              blocks: [{ type: 'text', content: t('chat.error', { message: data.errorMessage }) }],
              isError: true,
              timestamp: Date.now(),
            })
          } else {
            messages.value.push({
              role: 'assistant',
              blocks: parseResponse(data.response || ''),
              timestamp: Date.now(),
            })
          }
          return
        }

        if (data.status === 'error') {
          processing.value = false
          currentFunction.value = null
          pendingQuestion.value = null
          const msg = data.errorMessage || data.message || t('chat.unknownError')
          error.value = msg
          messages.value.push({
            role: 'assistant',
            blocks: [{ type: 'text', content: t('chat.error', { message: msg }) }],
            isError: true,
            timestamp: Date.now(),
          })
          return
        }

        if (data.status === 'processing') {
          currentFunction.value = data.currentFunction || null
          if (data.pendingQuestion) {
            pendingQuestion.value = data.pendingQuestion
          }
          pollTimer = setTimeout(poll, 1000)
          return
        }

        // idle
        processing.value = false
        currentFunction.value = null
      } catch (err) {
        processing.value = false
        currentFunction.value = null
        error.value = err.message
        messages.value.push({
          role: 'assistant',
          blocks: [{ type: 'text', content: t('chat.error', { message: err.message }) }],
          isError: true,
          timestamp: Date.now(),
        })
      }
    }

    await poll()
  }

  async function answerQuestion(positive, selectedOption = -1) {
    if (!pendingQuestion.value) return

    const questionId = pendingQuestion.value.id
    pendingQuestion.value = null

    try {
      await aiChatApi.answerQuestion(chatId.value, questionId, { positive, selectedOption })
      await pollForResponse()
    } catch (err) {
      error.value = err.message
      processing.value = false
    }
  }

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function setContext(objectId, objectName) {
    if (objectId) {
      const newContext = { type: 'object', object_name: objectName, object_id: objectId }
      const changed = !contextObject.value
        || contextObject.value.object_id !== objectId
      contextObject.value = newContext
      if (changed) contextSent.value = false
    } else {
      contextObject.value = null
      contextSent.value = false
    }
  }

  function clearContext() {
    contextObject.value = null
    contextSent.value = false
  }

  async function clearSession() {
    stopPolling()
    if (chatId.value) {
      await aiChatApi.clearChat(chatId.value).catch(() => {})
    }
    messages.value = []
    processing.value = false
    currentFunction.value = null
    error.value = null
    pendingQuestion.value = null
    contextSent.value = false
  }

  async function newSession() {
    stopPolling()
    if (chatId.value) {
      await aiChatApi.deleteChat(chatId.value).catch(() => {})
    }
    chatId.value = null
    messages.value = []
    processing.value = false
    currentFunction.value = null
    error.value = null
    pendingQuestion.value = null
    contextSent.value = false
  }

  return {
    chatId,
    messages,
    processing,
    currentFunction,
    error,
    pendingQuestion,
    hasChat,
    contextObject,
    createSession,
    sendMessage,
    answerQuestion,
    clearSession,
    newSession,
    setContext,
    clearContext,
  }
})
