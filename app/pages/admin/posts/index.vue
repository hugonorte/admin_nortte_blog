<script setup lang="ts">
import { ref, watch, onMounted, h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Post } from '~/types/models'
import { fetchPosts } from '~/api/post/post'
import { deletePost } from '~/api/post/delete'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const posts = ref<Post[]>([])
const isLoading = ref<boolean>(false)
const globalFilter = ref('')
const page = ref(1)
const pageCount = ref(10)
const total = ref(0)
const isDeleteModalOpen = ref(false)
const postToDelete = ref<string | null>(null)
const toast = useToast()

const confirmDelete = (id: string) => {
  postToDelete.value = id
  isDeleteModalOpen.value = true
}

const handleDelete = async () => {
  if (!postToDelete.value) return
  try {
    isLoading.value = true
    await deletePost(postToDelete.value)
    toast.add({ title: 'Sucesso', description: 'Post excluído com sucesso', color: 'success' })
    await loadPosts()
  } catch (error) {
    toast.add({ title: 'Erro', description: 'Não foi possível excluir o post', color: 'error' })
  } finally {
    isDeleteModalOpen.value = false
    postToDelete.value = null
    isLoading.value = false
  }
}

const loadPosts = async () => {
  isLoading.value = true
  try {
    const response = await fetchPosts(page.value - 1, pageCount.value)
    posts.value = response.content || []
    total.value = response.totalElements || 0
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPosts()
})

watch(page, () => {
  loadPosts()
})

const columns: TableColumn<Post>[] = [
  {
    accessorKey: 'title',
    header: 'Título'
  },
  {
    accessorKey: 'authorName',
    header: 'Autor',
  },
  {
    accessorKey: 'category',
    header: 'Categoria',
    cell: ({ row }) => {
      // row.original might have category as an object { id, name }
      const cat = row.getValue('category') as any
      return cat?.name || ''
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado em',
    cell: ({ row }) => {
      const dateVal = row.getValue('createdAt')
      if (!dateVal) return ''
      const date = new Date(dateVal as string)
      return date.toLocaleDateString('pt-BR')
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const rawStatus = row.getValue('status')
      if (!rawStatus) return h(resolveComponent('UBadge'), { color: 'neutral', variant: 'subtle', label: 'Indefinido' })
      
      const status = String(rawStatus).toLowerCase()
      switch (status) {
        case 'published':
          return h(resolveComponent('UBadge'), { color: 'success', variant: 'subtle', label: 'Publicado' })
        case 'draft':
          return h(resolveComponent('UBadge'), { color: 'warning', variant: 'subtle', label: 'Rascunho' })
        case 'archived':
          return h(resolveComponent('UBadge'), { color: 'error', variant: 'subtle', label: 'Arquivado' })
        default:
          return h(resolveComponent('UBadge'), { color: 'neutral', variant: 'subtle', label: String(rawStatus) })
      }
    }
  },
  {
    accessorKey: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const postId = String(row.original.id)
      return h('div', { class: 'flex gap-2' }, [
        h(resolveComponent('UButton'), { 
          color: 'primary', 
          size: 'sm', 
          icon: "i-lucide-pencil",
          to: `/admin/posts/${postId}` ,
          label: "Editar"
        }),
        h(resolveComponent('UButton'), { 
          color: 'error', 
          size: 'sm', 
          icon: "i-lucide-trash-2",
          class: "delete-post-btn",
          onClick: () => confirmDelete(postId)
        })
      ])
    }
  }
]
</script>

<template>
  <UPageBody>
      <UContainer>
          <UPageHeader title="Posts"  />
      </UContainer>
      <UContainer>
      <UCard>
        <template #header>
          <ULink href="/admin/posts/create">
            <UButton>Criar Novo post</UButton>
          </ULink>
        </template>
      </UCard>
      <UAlert v-if="isLoading" color="info" icon="i-lucide-loader-circle" :title="'Carregando...'" />
      <div v-else class="flex flex-col flex-1 w-full">
        <div class="flex px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Buscar..." />
        </div>

        <UTable ref="table" v-model:global-filter="globalFilter" :data="posts" :columns="columns" />
        
        <div class="flex justify-end px-3 py-3.5 border-t border-accented">
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="total"
          />
        </div>
      </div>

      <UModal v-model:open="isDeleteModalOpen">
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Confirmar Exclusão
              </h3>
            </template>
            <div class="py-4">
              <p>Você tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.</p>
            </div>
            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="ghost" @click="() => { isDeleteModalOpen = false }">Cancelar</UButton>
                <UButton color="error" @click="handleDelete">Excluir Post</UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </UPageBody>
</template>

