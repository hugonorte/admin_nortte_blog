<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import type { Category } from '~/types/models';
import { updateCategory } from '~/api/category/patch';
import { fetchCategoryById } from '~/api/category/get';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const categoryId = route.params.id as string

const state = reactive({
  name: undefined as string | undefined,
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors: FormError[] = []
  if (!state.name) errors.push({ name: 'name', message: 'O nome da categoria é um campo obrigatório' })
  return errors
}

const toast = useToast()
const isSubmitting = ref(false)

function onError(event: FormErrorEvent) {
  toast.add({
    title: 'Falha na Validação',
    description: 'Preencha os campos obrigatórios corretamente.',
    color: 'error',
  })
}

// Carregar dados
const isLoading = ref(true)
onMounted(async () => {
  try {
    const categoryData = await fetchCategoryById(categoryId)
    if (categoryData) {
      state.name = categoryData.name
    }
  } catch (error) {
    toast.add({
      title: 'Erro ao carregar categoria',
      description: 'Não foi possível carregar os dados desta categoria.',
      color: 'error',
    })
    navigateTo('/admin/category')
  } finally {
    isLoading.value = false
  }
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const categoryData: Partial<Category> = {
    name: event.data.name,
  }

  isSubmitting.value = true
  try {
    const submitId = useRoute().params.id as string
    await updateCategory(submitId, categoryData)
    toast.add({
      title: 'Categoria atualizada com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/category')
  } catch (error) {
    toast.add({
      title: 'Erro ao atualizar categoria',
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
        <UPageHeader title="Editar Categoria"  />
      </UContainer>
      
      <UContainer v-if="isLoading" class="py-8 text-center">
        <UAlert color="info" icon="i-lucide-loader-circle" title="Carregando..." />
      </UContainer>

      <UForm v-else :validate="validate" :state="state" class="generic_form" @submit="onSubmit" @error="onError">
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Dados da Categoria</h2>
            </template>

            <UFormField label="Nome" name="name" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.name" variant="subtle"  placeholder="Digite o nome da categoria" class="w-full" />
            </UFormField>
            
            <template #footer>
              <div class="flex gap-4">
                <UButton type="submit" color="warning">Salvar Alterações</UButton>
                <UButton variant="ghost" color="neutral" to="/admin/category">Cancelar</UButton>
              </div>
            </template>
          </UCard>
        </UContainer>
      </UForm>

      <SubmittingModal v-model:open="isSubmitting" label="Salvando categoria..." />
    </UPageBody>
</template>
