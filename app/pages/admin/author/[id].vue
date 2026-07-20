<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import type { Author } from '~/types/models';
import { updateAuthor } from '~/api/author/patch';
import { fetchAuthorById } from '~/api/author/get';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const authorId = computed(() => route.params.id as string)

const state = reactive({
  name: undefined as string | undefined,
  email: undefined as string | undefined,
  bio: undefined as string | undefined,
  main_title: undefined as string | undefined,
  preferred_social_network: undefined as string | undefined,
  preferred_social_network_username: undefined as string | undefined,
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors: FormError[] = []
  if (!state.name) errors.push({ name: 'name', message: 'O nome do autor é um campo obrigatório' })
  if (!state.email) errors.push({ name: 'email', message: 'O email do autor é um campo obrigatório' })
  if (!state.bio) errors.push({ name: 'bio', message: 'A biografia do autor é um campo obrigatório' })
  if (!state.main_title) errors.push({ name: 'main_title', message: 'O título principal do autor é um campo obrigatório' })
  if (!state.preferred_social_network) errors.push({ name: 'preferred_social_network', message: 'A rede social preferida do autor é um campo obrigatório' })
  if (!state.preferred_social_network_username) errors.push({ name: 'preferred_social_network_username', message: 'O nome de usuário da rede social preferida do autor é um campo obrigatório' })
  return errors
}

const toast = useToast()

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
    const authorData = await fetchAuthorById(authorId.value)
    if (authorData) {
      state.name = authorData.name
      state.email = authorData.email
      state.bio = authorData.bio
      state.main_title = authorData.main_title
      state.preferred_social_network = authorData.preferred_social_network
      state.preferred_social_network_username = authorData.preferred_social_network_username
    }
  } catch (error) {
    toast.add({
      title: 'Erro ao carregar autor',
      description: 'Não foi possível carregar os dados deste autor.',
      color: 'error',
    })
    navigateTo('/admin/author')
  } finally {
    isLoading.value = false
  }
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const authorData: Partial<Author> = {
    name: event.data.name,
    email: event.data.email,
    bio: event.data.bio,
    main_title: event.data.main_title,
    preferred_social_network: event.data.preferred_social_network,
    preferred_social_network_username: event.data.preferred_social_network_username,
  }

  try {
    const submitId = useRoute().params.id as string
    
    await updateAuthor(submitId, authorData)
    toast.add({
      title: 'Autor atualizado com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/author')
  } catch (error) {
    toast.add({
      title: 'Erro ao atualizar autor',
      description: 'Por favor, tente novamente.',
      color: 'error',
    })
  }
}
</script>

<template>
    <UPageBody class="w-full" >
      <UContainer >
        <UPageHeader title="Editar Autor"  />
      </UContainer>
      
      <UContainer v-if="isLoading" class="py-8 text-center">
        <UAlert color="info" icon="i-lucide-loader-circle" title="Carregando..." />
      </UContainer>

      <UForm v-else :validate="validate" :state="state" class="generic_form" @submit="onSubmit" @error="onError">
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Dados do Autor</h2>
            </template>

            <UFormField label="Nome" name="name" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.name" variant="subtle"  placeholder="Digite o nome do autor" class="w-full" />
            </UFormField>
            
            <UFormField label="Email" name="email" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.email" type="email" variant="subtle"  placeholder="Digite o email do autor" class="w-full" />
            </UFormField>

            <UFormField label="Biografia" name="bio" class="mb-5" :ui="{ label: 'custom-label' }">
              <UTextarea v-model="state.bio" variant="subtle"  placeholder="Digite uma breve biografia do autor" class="w-full" />
            </UFormField>

            <UFormField label="Título Profissional ou Acadêmico Principal (Ex: Doutor, Mestre, etc)" name="main_title" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.main_title" variant="subtle"  placeholder="Digite o título principal do autor" class="w-full" />
            </UFormField>

            <UFormField label="Rede Social onde o autor é mais ativo" name="preferred_social_network" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.preferred_social_network" variant="subtle"  placeholder="Digite a rede social preferida do autor" class="w-full" />
            </UFormField>

            <UFormField label="Nome de Usuário na Rede Social onde o autor é mais ativo" name="preferred_social_network_username" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.preferred_social_network_username" variant="subtle"  placeholder="Digite o nome de usuário da rede social preferida do autor" class="w-full" />
            </UFormField>

            <template #footer>
              <div class="flex gap-4">
                <UButton type="submit" color="warning">Salvar Alterações</UButton>
                <UButton variant="ghost" color="neutral" to="/admin/author">Cancelar</UButton>
              </div>
            </template>
          </UCard>
        </UContainer>
      </UForm>
    </UPageBody>
</template>
