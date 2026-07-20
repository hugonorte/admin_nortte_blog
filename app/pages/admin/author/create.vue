<script setup lang="ts">
  import type { FormError, FormSubmitEvent,
  EditorCustomHandlers, 
  EditorSuggestionMenuItem, 
  EditorMentionMenuItem, 
  EditorEmojiMenuItem, 
  DropdownMenuItem
 } from '@nuxt/ui'
import type { Author } from '~/types/models';
import { createAuthor } from '~/api/author/post';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const state = reactive({
  name: undefined,
  email: undefined,
  bio: undefined,
  main_title: undefined,
  preferred_social_network: undefined,
  preferred_social_network_username: undefined,
})

type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'O nome do autor é um campo obrigatório' })
  if (!state.email) errors.push({ name: 'email', message: 'O email do autor é um campo obrigatório' })
  if (!state.bio) errors.push({ name: 'bio', message: 'A biografia do autor é um campo obrigatório' })
  if (!state.main_title) errors.push({ name: 'main_title', message: 'O título principal do autor é um campo obrigatório' })
  if (!state.preferred_social_network) errors.push({ name: 'preferred_social_network', message: 'A rede social preferida do autor é um campo obrigatório' })
  if (!state.preferred_social_network_username) errors.push({ name: 'preferred_social_network_username', message: 'O nome de usuário da rede social preferida do autor é um campo obrigatório' })
  return errors
}

const toast = useToast()

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const authorData: Author = {
    name: event.data.name,
    email: event.data.email,
    bio: event.data.bio,
    main_title: event.data.main_title,
    preferred_social_network: event.data.preferred_social_network,
    preferred_social_network_username: event.data.preferred_social_network_username,
  }

  try {
    await createAuthor(authorData)
    toast.add({
      title: 'Autor criado com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/author')
  } catch (error) {
    toast.add({
      title: 'Erro ao criar autor',
      description: 'Por favor, tente novamente.',
      color: 'error',
    })
  }
}
</script>
<template>
    <UPageBody class="w-full" >
      <UContainer >
        <UPageHeader title="Autores"  />
      </UContainer>
      <UForm :validate="validate" :state="state" class="generic_form"   @submit="onSubmit" >
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Novo Autor</h2>
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
              <UButton type="submit" color="warning">Criar Novo Autor</UButton>
            </template>
          </UCard>
        </UContainer>
      </UForm>
    </UPageBody>
</template> 