<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~/types/models'
import { fetchUsers, type PaginatedResponse } from '~/api/user/get'
import { deleteUser } from '~/api/user/delete'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const auth = useAuth()
const currentUser = ref<User | null>(null)
const users = ref<User[]>([])
const isLoading = ref<boolean>(false)
const globalFilter = ref('')
const toast = useToast()

const page = ref(1)
const pageSize = ref(20)
const totalElements = ref(0)

const isDeleteModalOpen = ref(false)
const userToDelete = ref<User | null>(null)

async function loadUsers() {
  isLoading.value = true
  try {
    const response = await fetchUsers(page.value - 1, pageSize.value)
    users.value = response.content
    totalElements.value = response.totalElements
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    currentUser.value = await auth.getUser() as User | null
  } catch (error) {
    console.error('Error fetching current user:', error)
  }
  await loadUsers()
})

watch(page, () => {
  loadUsers()
})

function confirmDelete(user: User) {
  if (currentUser.value?.id === user.id) {
    toast.add({
      title: 'Ação Bloqueada',
      description: 'Você não pode excluir o seu próprio usuário.',
      color: 'error'
    })
    return
  }
  userToDelete.value = user
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  userToDelete.value = null
}

async function handleDelete() {
  if (!userToDelete.value || !userToDelete.value.id) return
  
  try {
    await deleteUser(userToDelete.value.id)
    toast.add({
      title: 'Usuário excluído com sucesso!',
      color: 'success'
    })
    // Atualizar a lista removendo o usuário excluído
    users.value = users.value.filter(u => u.id !== userToDelete.value!.id)
  } catch (error) {
    toast.add({
      title: 'Erro ao excluir usuário',
      description: 'Por favor, tente novamente.',
      color: 'error'
    })
  } finally {
    isDeleteModalOpen.value = false
    userToDelete.value = null
  }
}

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'first_name',
    header: 'Nome',
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ''}`
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'role',
    header: 'Role'
  },
  {
    id: 'actions',
    header: 'Ações'
  }
]
</script>

<template>
  <UPageBody>
      <UContainer>
          <UPageHeader title="Usuários"  />
      </UContainer>
      <UContainer>
      <UCard>
        <template #header>
          <ULink href="/admin/user/create">
            <UButton>Criar Novo usuário</UButton>
          </ULink>
        </template>
      </UCard>
      <UAlert v-if="isLoading" color="info" icon="i-lucide-loader-circle" :title="'Carregando...'" />
      <div v-else class="flex flex-col flex-1 w-full">
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Buscar..." />
        </div>

        <UTable ref="table" v-model:global-filter="globalFilter" :data="users" :columns="columns">
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" :to="`/admin/user/${row.original.id}`" />
              <UButton icon="i-lucide-trash" variant="ghost" color="error" @click="confirmDelete(row.original)" />
            </div>
          </template>
        </UTable>

        <div class="flex justify-end px-4 py-3 border-t border-accented">
          <UPagination v-model="page" :page-count="pageSize" :total="totalElements" />
        </div>
      </div>

      <UModal v-model:open="isDeleteModalOpen">
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Confirmar exclusão</h3>
            </template>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tem certeza de que deseja excluir permanentemente o usuário <b>{{ userToDelete?.first_name }} {{ userToDelete?.last_name || '' }}</b>? Esta ação não pode ser desfeita.
            </p>
            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="ghost" @click="closeDeleteModal">Cancelar</UButton>
                <UButton color="error" @click="handleDelete">Sim, Excluir</UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </UPageBody>
</template>
