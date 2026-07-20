<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Author } from '~/types/models'
import { fetchAuthors, type PaginatedResponse } from '~/api/author/get'
import { deleteAuthor } from '~/api/author/delete'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const Authors = ref<Author[]>([])
const isLoading = ref<boolean>(false)
const globalFilter = ref('')
const toast = useToast()

const page = ref(1)
const pageSize = ref(20)
const totalElements = ref(0)

const isDeleteModalOpen = ref(false)
const authorToDelete = ref<Author | null>(null)

function confirmDelete(author: Author) {
  authorToDelete.value = author
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  authorToDelete.value = null
}

async function handleDelete() {
  if (!authorToDelete.value || !authorToDelete.value.id) return
  
  try {
    await deleteAuthor(authorToDelete.value.id)
    toast.add({
      title: 'Autor excluído com sucesso!',
      color: 'success'
    })
    Authors.value = Authors.value.filter(a => a.id !== authorToDelete.value!.id)
  } catch (error) {
    toast.add({
      title: 'Erro ao excluir autor',
      description: 'Por favor, tente novamente.',
      color: 'error'
    })
  } finally {
    closeDeleteModal()
  }
}

async function loadAuthors() {
  isLoading.value = true
  try {
    const response = await fetchAuthors(page.value - 1, pageSize.value)
    Authors.value = response.content
    totalElements.value = response.totalElements
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadAuthors()
})

watch(page, () => {
  loadAuthors()
})

const columns: TableColumn<Author>[] = [
  {
    accessorKey: 'name',
    header: 'Nome'
  },
  {
    accessorKey: 'email',
    header: 'Email'
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
          <UPageHeader title="Autores"  />
      </UContainer>
      <UContainer>
      <UCard>
        <template #header>
          <ULink href="/admin/author/create">
            <UButton>Criar Novo autor</UButton>
          </ULink>
        </template>
      </UCard>
      <UAlert v-if="isLoading" color="info" icon="i-lucide-loader-circle" :title="'Carregando...'" />
      <div v-else class="flex flex-col flex-1 w-full">
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Buscar..." />
        </div>

        <UTable ref="table" v-model:global-filter="globalFilter" :data="Authors" :columns="columns">
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" :to="`/admin/author/${row.original.id}`" />
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
              Tem certeza de que deseja excluir permanentemente o autor <b>{{ authorToDelete?.name }}</b>? Esta ação não pode ser desfeita.
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