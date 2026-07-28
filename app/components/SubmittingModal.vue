<script setup lang="ts">
defineProps<{
  label?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" :close="false">
    <template #content>
      <UCard>
        <div class="flex flex-col items-center gap-3 py-4">
          <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-primary" />
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ label ?? 'Salvando...' }}</p>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
