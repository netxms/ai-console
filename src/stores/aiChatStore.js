import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as aiChatApi from '@/api/aiChatApi'
import { parseResponse } from '@/utils/parseResponse'

export const useAiChatStore = defineStore('aiChat', () => {
  const chatId = ref(null)
  const messages = ref([])
  const processing = ref(false)
  const currentFunction = ref(null)
  const error = ref(null)
  const pendingQuestion = ref(null)

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
      await aiChatApi.sendMessage(chatId.value, text)
      await pollForResponse()
    } catch (err) {
      processing.value = false
      currentFunction.value = null
      error.value = err.message
      messages.value.push({
        role: 'assistant',
        blocks: [{ type: 'text', content: `Error: ${err.message}` }],
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
          messages.value.push({
            role: 'assistant',
            blocks: parseResponse(data.response || ''),
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
  }

  return {
    chatId,
    messages,
    processing,
    currentFunction,
    error,
    pendingQuestion,
    hasChat,
    createSession,
    sendMessage,
    answerQuestion,
    clearSession,
    newSession,
  }
})
