<script setup></script>

<template>
  <div class="processing-indicator">
    <div class="assistant-avatar">
      <i class="pi pi-sparkles" />
    </div>
    <div class="dots">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
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

.dots {
  display: flex;
  gap: 4px;
  padding: 0.625rem 0.875rem;
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 2px 12px 12px 12px;
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
</style>
