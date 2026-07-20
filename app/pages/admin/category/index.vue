<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '~/types/models'
import { fetchCategories } from '~/api/category/get'
import { deleteCategory } from '~/api/category/delete'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const Categories = ref<Category[]>([])
const isLoading = ref<boolean>(false)
const globalFilter = ref('')
const toast = useToast()

const isDeleteModalOpen = ref(false)
const categoryToDelete = ref<Category | null>(null)

function confirmDelete(category: Category) {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}

async function handleDelete() {
  if (!categoryToDelete.value || !categoryToDelete.value.id) return
  
  try {
    await deleteCategory(categoryToDelete.value.id)
    toast.add({
      title: 'Categoria excluída com sucesso!',
      color: 'success'
    })
    Categories.value = Categories.value.filter(c => c.id !== categoryToDelete.value!.id)
  } catch (error) {
    toast.add({
      title: 'Erro ao excluir categoria',
      description: 'Por favor, tente novamente.',
      color: 'error'
    })
  } finally {
    closeDeleteModal()
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    Categories.value = await fetchCategories()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Nome'
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
          <UPageHeader title="Categorias"  />
      </UContainer>
      <UContainer>
      <UCard>
        <template #header>
          <ULink href="/admin/category/create">
            <UButton>Criar Nova Categoria</UButton>
          </ULink>
        </template>
      </UCard>
      <UAlert v-if="isLoading" color="info" icon="i-lucide-loader-circle" :title="'Carregando...'" />
      <div v-else class="flex flex-col flex-1 w-full">
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Buscar..." />
        </div>

        <UTable ref="table" v-model:global-filter="globalFilter" :data="Categories" :columns="columns">
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" :to="`/admin/category/${row.original.id}`" />
              <UButton icon="i-lucide-trash" variant="ghost" color="error" @click="confirmDelete(row.original)" />
            </div>
          </template>
        </UTable>
      </div>

      <UModal v-model:open="isDeleteModalOpen">
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Confirmar exclusão</h3>
            </template>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tem certeza de que deseja excluir permanentemente a categoria <b>{{ categoryToDelete?.name }}</b>? Esta ação não pode ser desfeita.
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