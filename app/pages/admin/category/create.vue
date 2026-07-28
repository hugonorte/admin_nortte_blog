<script setup lang="ts">
  import type { FormError, FormSubmitEvent,
  EditorCustomHandlers, 
  EditorSuggestionMenuItem, 
  EditorMentionMenuItem, 
  EditorEmojiMenuItem, 
  DropdownMenuItem
 } from '@nuxt/ui'
import type { Category } from '~/types/models';
import { createCategory } from '~/api/category/post';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const state = reactive({
  name: undefined,
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'O nome da categoria é um campo obrigatório' })
  return errors
}

const toast = useToast()
const isSubmitting = ref(false)

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const categoryData: Category = {
    name: event.data.name,
  }

  isSubmitting.value = true
  try {
    await createCategory(categoryData)
    toast.add({
      title: 'Categoria criada com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/category')
  } catch (error) {
    toast.add({
      title: 'Erro ao criar categoria',
      description: 'Por favor, tente novamente.',
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
    <UPageBody class="w-full" >
      <UContainer >
        <UPageHeader title="Categorias"  />
      </UContainer>
      <UForm :validate="validate" :state="state" class="generic_form"   @submit="onSubmit" >
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Nova Categoria</h2>
            </template>

            <UFormField label="Nome" name="name" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.name" variant="subtle"  placeholder="Digite o nome da categoria" class="w-full" />
            </UFormField>
            
            <template #footer>
              <UButton type="submit" color="warning">Criar Nova Categoria</UButton>
            </template>
          </UCard>
        </UContainer>
      </UForm>

      <SubmittingModal v-model:open="isSubmitting" label="Criando categoria..." />
    </UPageBody>
</template> 