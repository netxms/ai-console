import { post, get, del } from './client'

export function createChat() {
  return post('/v1/ai/chat', { capabilities: ['visualizations'] })
}

export function sendMessage(chatId, message) {
  return post(`/v1/ai/chat/${chatId}/message`, { message })
}

export function getStatus(chatId) {
  return get(`/v1/ai/chat/${chatId}/status`)
}

export function pollQuestion(chatId) {
  return get(`/v1/ai/chat/${chatId}/question`)
}

export function answerQuestion(chatId, questionId, { positive = false, selectedOption = -1 } = {}) {
  return post(`/v1/ai/chat/${chatId}/answer`, { questionId, positive, selectedOption })
}

export function clearChat(chatId) {
  return post(`/v1/ai/chat/${chatId}/clear`)
}

export function deleteChat(chatId) {
  return del(`/v1/ai/chat/${chatId}`)
}
