<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import type { User } from '~/types/models';
import { updateUser } from '~/api/user/patch';
import { fetchUserById } from '~/api/user/get';
import { fetchRoles, type Role } from '~/api/roles/get';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const userId = computed(() => route.params.id as string)

const schema = z.object({
  first_name: z.string({ required_error: 'O nome é um campo obrigatório' }).min(1, 'O nome é obrigatório'),
  last_name: z.string({ required_error: 'O sobrenome é um campo obrigatório' }).min(1, 'O sobrenome é obrigatório'),
  email: z.string({ required_error: 'O email é um campo obrigatório' }).email('Email inválido'),
  role: z.string({ required_error: 'A role é um campo obrigatório' }).min(1, 'A role é obrigatória'),
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  role: undefined,
})

const toast = useToast()

function onError(event: FormErrorEvent) {
  toast.add({
    title: 'Falha na Validação',
    description: 'Preencha os campos obrigatórios corretamente.',
    color: 'error',
  })
}

const roleOptions = ref<{label: string, value: string}[]>([])

// Carregar dados do usuário
const isLoading = ref(true)
onMounted(async () => {
  try {
    const [userData, rolesData] = await Promise.all([
      fetchUserById(userId.value),
      fetchRoles()
    ])
    
    if (rolesData) {
      roleOptions.value = rolesData.map(role => ({ label: role.name, value: role.id }))
    }

    if (userData) {
      state.first_name = userData.first_name
      state.last_name = userData.last_name
      state.email = userData.email
      state.role = userData.role
    }
  } catch (error) {
    toast.add({
      title: 'Erro ao carregar os dados',
      description: 'Não foi possível carregar as informações deste usuário ou as permissões.',
      color: 'error',
    })
    navigateTo('/admin/user')
  } finally {
    isLoading.value = false
  }
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const userData: Partial<User> = {
    first_name: event.data.first_name,
    last_name: event.data.last_name,
    email: event.data.email,
    role: event.data.role,
  }

  try {
    const submitId = useRoute().params.id as string
    await updateUser(submitId, userData)
    toast.add({
      title: 'Usuário atualizado com sucesso!',
      color: 'success',
    })
    await navigateTo('/admin/user')
  } catch (error) {
    toast.add({
      title: 'Erro ao atualizar usuário',
      description: 'Por favor, tente novamente.',
      color: 'error',
    })
  }
}
</script>
<template>
    <UPageBody class="w-full" >
      <UContainer >
        <UPageHeader title="Editar Usuário"  />
      </UContainer>
      
      <UContainer v-if="isLoading" class="py-8 text-center">
        <UAlert color="info" icon="i-lucide-loader-circle" title="Carregando..." />
      </UContainer>

      <UForm v-else :schema="schema" :state="state" class="generic_form" @submit="onSubmit" @error="onError">
        <UContainer >
          <UCard>
            <template #header>
              <h2 class="text-lg font-medium">Dados do Usuário</h2>
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

            <template #footer>
              <div class="flex gap-4">
                <UButton type="submit" color="warning">Salvar Alterações</UButton>
                <UButton variant="ghost" color="neutral" to="/admin/user">Cancelar</UButton>
              </div>
            </template>
          </UCard>
        </UContainer>
      </UForm>
    </UPageBody>
</template>
