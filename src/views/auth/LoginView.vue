<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/authStore'
import { brand } from '@/brands'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

async function handleLogin() {
  const success = await authStore.login(username.value, password.value)
  if (success) {
    router.push(route.query.redirect || '/')
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-form" @submit.prevent="handleLogin">
      <div class="login-header">
        <img :src="brand.logo" :alt="brand.name" class="login-logo" />
        <span class="login-subtitle">{{ brand.title }}</span>
      </div>

      <Message v-if="authStore.error" severity="error" :closable="false">
        {{ authStore.error }}
      </Message>

      <div class="field">
        <label for="username">Username</label>
        <InputText
          id="username"
          v-model="username"
          autocomplete="username"
          :fluid="true"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <Password
          id="password"
          v-model="password"
          :feedback="false"
          toggle-mask
          autocomplete="current-password"
          :fluid="true"
          @keyup.enter="handleLogin"
        />
      </div>

      <Button
        label="Sign In"
        type="submit"
        :loading="authStore.loading"
        :fluid="true"
      />
    </form>
  </div>
</template>

<style>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--p-surface-ground);
}

.login-form {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: var(--p-surface-card);
  border-radius: 12px;
  border: 1px solid var(--p-surface-border);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.login-logo {
  max-width: 200px;
  height: auto;
}

.login-subtitle {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
