<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import type { User } from '~/types/models';
import { createUser } from '~/api/user/post';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const schema = z.object({
  first_name: z.string({ required_error: 'O nome é um campo obrigatório' }).min(1, 'O nome é obrigatório'),
  last_name: z.string({ required_error: 'O sobrenome é um campo obrigatório' }).min(1, 'O sobrenome é obrigatório'),
  email: z.string({ required_error: 'O email é um campo obrigatório' }).email('Email inválido'),
  role: z.string({ required_error: 'A role é um campo obrigatório' }).min(1, 'A role é obrigatória'),
  password: z.string({ required_error: 'A senha é um campo obrigatório' }).min(6, 'A senha deve ter no mínimo 6 caracteres')
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  role: undefined,
  password: undefined,
})

const toast = useToast()

function onError(event: FormErrorEvent) {
  toast.add({
    title: 'Falha na Validação',
    description: 'Preencha os campos obrigatórios corretamente.',
    color: 'error',
  })
}

import { fetchRoles, type Role } from '~/api/roles/get';

const roleOptions = ref<{label: string, value: string}[]>([])

onMounted(async () => {
  try {
    const rolesData = await fetchRoles()
    if (rolesData) {
      roleOptions.value = rolesData.map(role => ({ label: role.name, value: role.id }))
    }
  } catch (error) {
    toast.add({
      title: 'Erro ao carregar permissões',
      description: 'Não foi possível carregar as opções de role.',
      color: 'error',
    })
  }
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const userData: User & { password?: string } = {
    first_name: event.data.first_name,
    last_name: event.data.last_name,
    email: event.data.email,
    role: event.data.role,
    password: event.data.password,
  }

  try {
    await createUser(userData)
    toast.add({
      title: 'Usuário criado com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/user')
  } catch (error) {
    toast.add({
      title: 'Erro ao criar usuário',
      description: 'Por favor, tente novamente.',
      color: 'error',
    })
  }
}
</script>
<template>
    <UPageBody class="w-full" >
      <UContainer >
        <UPageHeader title="Usuários"  />
      </UContainer>
      <UForm :schema="schema" :state="state" class="generic_form" @submit="onSubmit" @error="onError">
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Novo Usuário</h2>
            </template>

            <UFormField label="Nome" name="first_name" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.first_name" variant="subtle"  placeholder="Digite o nome" class="w-full" />
            </UFormField>
            
            <UFormField label="Sobrenome" name="last_name" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.last_name" variant="subtle"  placeholder="Digite o sobrenome" class="w-full" />
            </UFormField>

            <UFormField label="Email" name="email" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.email" type="email" variant="subtle"  placeholder="Digite o email" class="w-full" />
            </UFormField>

            <UFormField label="Role" name="role" class="mb-5" :ui="{ label: 'custom-label' }">
              <USelect v-model="state.role" :items="roleOptions" variant="subtle" placeholder="Selecione a permissão" class="w-full" />
            </UFormField>

            <UFormField label="Senha" name="password" class="mb-5" :ui="{ label: 'custom-label' }">
              <UInput v-model="state.password" type="password" variant="subtle"  placeholder="Digite a senha" class="w-full" />
            </UFormField>
            
            <template #footer>
              <UButton type="submit" color="warning">Criar Novo Usuário</UButton>
            </template>
          </UCard>
        </UContainer>
      </UForm>
    </UPageBody>
</template>
