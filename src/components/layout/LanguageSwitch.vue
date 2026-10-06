<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useLocaleStore } from '@/stores/localeStore'
import { t } from '@/i18n'

const localeStore = useLocaleStore()
const menu = ref(null)

const items = computed(() => localeStore.locales.map((l) => ({
   label: l.name,
   code: l.code,
   command: () => localeStore.setLocale(l.code),
})))
</script>

<template>
   <Button
      icon="pi pi-globe"
      :label="localeStore.locale.toUpperCase()"
      severity="secondary"
      text
      size="small"
      aria-haspopup="true"
      v-tooltip.bottom="t('header.language')"
      @click="menu.toggle($event)"
   />
   <Menu ref="menu" :model="items" popup>
      <template #item="{ item, props }">
         <a v-bind="props.action" class="language-item" :lang="item.code">
            <span>{{ item.label }}</span>
            <i v-if="item.code === localeStore.locale" class="pi pi-check language-item-check" />
         </a>
      </template>
   </Menu>
</template>

<style>
.language-item-check {
   margin-inline-start: auto;
   font-size: 0.8rem;
}
</style>
