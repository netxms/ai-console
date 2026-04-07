import { get, post, put, del } from './client'

export function listPrompts() {
   return get('/v1/ai/saved-prompts')
}

export function createPrompt({ name, promptText, description }) {
   return post('/v1/ai/saved-prompts', { name, promptText, description })
}

export function updatePrompt(id, { name, promptText, description }) {
   return put(`/v1/ai/saved-prompts/${id}`, { name, promptText, description })
}

export function deletePrompt(id) {
   return del(`/v1/ai/saved-prompts/${id}`)
}
