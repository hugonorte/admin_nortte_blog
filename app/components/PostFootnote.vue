<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: ''
})

const description = defineModel<string>('description')
</script>

<template>
    <UContainer class="w-full mb-8" style="padding: 0;">
        <p class="w-full">
            <UPageFeature as="h5" :title="title" class="p-3" />
        </p>
        <UTextarea v-model="description" class="w-full" color="neutral" variant="subtle" placeholder="Digite a nota de rodapé aqui..." name="description"/>
    </UContainer>
</template>