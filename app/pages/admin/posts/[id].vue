<script setup lang="ts">
import type {
  FormError, FormSubmitEvent,
  EditorCustomHandlers,
  EditorToolbarItem
} from '@nuxt/ui'
import type { Post, BibliographicReference, Footnote , Author , Category  } from '~/types/models';
import PostReference from '~/components/PostReference.vue';
import { fetchAuthors } from '~/api/author/get'
import { fetchCategories } from '~/api/category/get'
import { fetchPostById } from '~/api/post/get'
import { updatePost, updatePostStatus } from '~/api/post/patch'
import { uploadFile } from '~/api/upload/upload'
import { ref, computed, reactive, onMounted, markRaw } from 'vue' // Ensuring imports are consolidated if needed, or rely on Nuxt auto-imports but keeping structure
import type { Editor } from '@tiptap/vue-3'
import ImageUploadExtension from './EditorImageUploadExtension'
import { fetchBibliographicReferenceByPostId } from '~/api/bibliographicReference/get';
import { fetchFootnoteByPostId } from '~/api/footnote/get';
import { updateBibliographicReference } from '~/api/bibliographicReference/patch';
import { createBibliographicReferences } from '~/api/bibliographicReference/post';
import { deleteBibliographicReference } from '~/api/bibliographicReference/delete';
import { updateFootnote } from '~/api/footnote/patch';
import { createFootnote } from '~/api/footnote/post';
import { deleteFootnote } from '~/api/footnote/delete';

const postId = useRoute().params.id
const config = useRuntimeConfig()

// Create a fresh instance of the extension for this component
// Use markRaw to prevent Vue's reactivity system from wrapping Tiptap objects
const editorExtensions = markRaw([markRaw(ImageUploadExtension)])

const customHandlers = markRaw({
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined
  }
}) satisfies EditorCustomHandlers

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
  ssr: false, // Ensure this page is client-side only
})

const isLoading = ref<boolean>(true)
const Authors = ref<Author[]>([])
const Categories = ref<Category[]>([])
const Post = ref<Post>({})
const toast = useToast()
const initialBibliographicReferences = ref<BibliographicReference[]>([])
const BibliographicReferences = ref<BibliographicReference[]>([])
const initialFootnotes = ref<Footnote[]>([])
const Footnotes = ref<Footnote[]>([])
const currentImage = ref<string | null>(null)

// Computed property to display image URL
const currentImageUrl = computed(() => {
    if (!currentImage.value) return null
    if (currentImage.value.startsWith('http')) return currentImage.value
    const folder = config.public.publicImagesFolder?.replace(/\/$/, '') || ''
    const imagePath = currentImage.value.startsWith('/') ? currentImage.value : `/${currentImage.value}`
    return `${folder}${imagePath}`
})

onMounted(async () => {
  isLoading.value = true
  try {
    const post = await fetchPostById(postId as string)
    Post.value = post

    state.title = post.title || ''
    state.tldr = post.tldr || ''
    
    state.formatType = post.formatType || 'HTML'
    if (state.formatType === 'HTML') {
      state.contentHtml = post.content || ''
    } else {
      state.contentMarkdown = post.content || ''
    }

    state.author = (post as any).authorId
    state.categories = (post as any).category?.id 
    state.status = post.status
    
    // Check if imagePath exists and assign to currentImage NOT state.imagePath
    if ((post as any).imagePath) {
        currentImage.value = (post as any).imagePath
    }

    const authorsResponse = await fetchAuthors()
    Authors.value = Array.isArray((authorsResponse as any)?.content) 
        ? (authorsResponse as any).content 
        : (Array.isArray(authorsResponse) ? authorsResponse : [])

    const categoriesResponse = await fetchCategories()
    Categories.value = Array.isArray((categoriesResponse as any)?.content) 
        ? (categoriesResponse as any).content 
        : (Array.isArray(categoriesResponse) ? categoriesResponse : [])
    initialBibliographicReferences.value = await fetchBibliographicReferenceByPostId(Post.value.id as number)
    BibliographicReferences.value = initialBibliographicReferences.value.map(ref => ({ ...ref }))
    initialFootnotes.value = await fetchFootnoteByPostId(Post.value.id as number)
    Footnotes.value = initialFootnotes.value.map(footnote => ({...footnote}))
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const markdownInputMethod = ref('text')

const state = reactive({
  title: '',
  tldr: '',
  contentHtml: '',
  contentMarkdown: '',
  formatType: 'HTML',
  categories: undefined as number | undefined,
  imagePath: undefined as any, // Should remain undefined or be a File/FileList
  author: undefined as number | undefined,
  status: undefined as string | undefined,
})



type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.title) errors.push({ name: 'title', message: 'O título do post é um campo obrigatório' })
  if (!state.tldr) errors.push({ name: 'tldr', message: 'O resumo do post é um campo obrigatório' })
  if (state.formatType === 'HTML' && !state.contentHtml) errors.push({ name: 'contentHtml', message: 'O conteúdo do post é um campo obrigatório' })
  if (state.formatType === 'MARKDOWN' && !state.contentMarkdown) errors.push({ name: 'contentMarkdown', message: 'O conteúdo do post é um campo obrigatório' })
  if (!state.categories || state.categories === undefined) errors.push({ name: 'categories', message: 'Pelo menos uma categoria deve ser selecionada' })

  // Validate image: required only if no current image exists AND no new image is uploaded
  if (!state.imagePath && !currentImage.value) {
    errors.push({ name: 'imagePath', message: 'A imagem do post é um campo obrigatório' })
  }

  if (!state.author) errors.push({ name: 'author', message: 'O autor do post é um campo obrigatório' })
  if (!state.status) errors.push({ name: 'status', message: 'O status do post é um campo obrigatório' })
  return errors
}

type EditorToolbarItemType =
  EditorToolbarItem<typeof customHandlers>[]

const items: EditorToolbarItemType[] = [
  [
    {
      kind: 'imageUpload',
      icon: 'i-lucide-image',
      label: 'Add image',
      variant: 'soft'
    }
  ],
  [
    {
      icon: 'i-lucide-heading',
      content: {
        align: 'start'
      },
      items: [
        {
          kind: 'heading',
          level: 1,
          icon: 'i-lucide-heading-1',
          label: 'Heading 1'
        },
        {
          kind: 'heading',
          level: 2,
          icon: 'i-lucide-heading-2',
          label: 'Heading 2'
        },
        {
          kind: 'heading',
          level: 3,
          icon: 'i-lucide-heading-3',
          label: 'Heading 3'
        },
        {
          kind: 'heading',
          level: 4,
          icon: 'i-lucide-heading-4',
          label: 'Heading 4'
        }
      ]
    }
  ],
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'i-lucide-bold'
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic'
    },
    {
      kind: 'mark',
      mark: 'underline',
      icon: 'i-lucide-underline'
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough'
    },
    {
      kind: 'mark',
      mark: 'code',
      icon: 'i-lucide-code'
    },
    { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
    { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
    { kind: 'bulletList', icon: 'i-lucide-list' },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
    { kind: 'blockquote', icon: 'i-lucide-quote' },
    { kind: 'link', icon: 'i-lucide-link' },
  ]
] satisfies EditorToolbarItem<typeof customHandlers>[][]

// Example authors for the input menu ## Alterar para buscar do backend
const authorOptions = computed(() =>
  Authors.value.map((author) => ({ label: author.name, value: author.id }))
)

const statusOptions = computed(() =>
  [
    { label: 'Rascunho', value: 'DRAFT' },
    { label: 'Publicado', value: 'PUBLISHED' },
    { label: 'Arquivado', value: 'ARCHIVED' },
  ]
)

// Example categories for the input menu ## Alterar para buscar do backend
const categoryOptions = computed(() =>
  Categories.value.map((category) => ({ label: category.name, value: category.id }))
)

const addReference = () => {
  BibliographicReferences.value.push(
    {
      id: String((BibliographicReferences.value.length + 1)*-1),
      description: ""
    }
  )
}

const addFootnote = () => {
  Footnotes.value.push(
    {
      id: String((Footnotes.value.length + 1)*-1),
      description: ""
    }
  )
}

const onMarkdownFileChange = (val: any) => {
  if (!val) return;
  const file = Array.isArray(val) ? val[0] : val;
  if (file && file instanceof File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      state.contentMarkdown = e.target?.result as string
    }
    reader.readAsText(file)
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    let imagePathUrl = currentImage.value || '';

    // Only upload image if a NEW one is selected
    if (state.imagePath) {
      const file = Array.isArray(state.imagePath) ? state.imagePath[0] : state.imagePath;
      imagePathUrl = await uploadFile(file, 'post');
    }

    const slug = state.title ? state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';

    const postPayload = {
      title: state.title!,
      slug: slug,
      content: state.formatType === 'HTML' ? state.contentHtml! : state.contentMarkdown!,
      tldr: state.tldr!,
      imagePath: imagePathUrl,
      categoryId: String(state.categories!),
      authorId: String(state.author!),
      formatType: state.formatType!
    };

    const post = await updatePost(postId as string, postPayload);

    // Update status separately using the dedicated PATCH endpoint
    if (state.status && state.status !== (Post.value as any).status) {
      await updatePostStatus(postId as string, state.status);
    }

    toast.add({ title: 'Success', description: 'Post atualizado com sucesso.', color: 'success' })
    await navigateTo('/admin/posts')
  } catch (error: any) {
    console.error(error);
    toast.add({ title: 'Error', description: 'Erro: ' + (error?.message || error), color: 'error' })
  }
}

const updateReference = async (id: string | undefined) => {
  const filteredObj = BibliographicReferences.value.filter((reference) => reference.id == id)[0]
  const updatedDescription = filteredObj?.description
  if (updatedDescription == "") return
  if (updatedDescription === undefined) return
  if (id === undefined) return

  try {
    const response = await updateBibliographicReference(id !== undefined ? String(id) : "", updatedDescription)
    toast.add({ title: 'Success', description: 'Referência atualizada com sucesso.', color: 'success' })
    
    // Update the initial list as well to keep them in sync after a successful update
    const initialIndex = initialBibliographicReferences.value.findIndex(r => r.id === id)
    const initialItem = initialBibliographicReferences.value[initialIndex]
    if (initialItem && updatedDescription !== undefined) {
      initialItem.description = updatedDescription
    }
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao atualizar referência.', color: 'error' })
  }
}

const removeReference = async (id: string | undefined) => {
  if (id === undefined) return
  if (Number(id) < 0) {
    BibliographicReferences.value = BibliographicReferences.value.filter(r => r.id !== id)
    return
  }

  try {
    await deleteBibliographicReference(String(id))
    toast.add({ title: 'Success', description: 'Referência removida com sucesso.', color: 'success' })
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao remover referência.', color: 'error' })
  }
}

const saveNewReference = async (tempId: string | undefined) => {
  const reference = BibliographicReferences.value.find(r => r.id === tempId)
  if (!reference) return

  try {
    const newRef = await createBibliographicReferences({
      post_id: String(postId),
      description: reference.description
    })
    
    // Substitui o item temporário pelo item retornado do backend
    const index = BibliographicReferences.value.findIndex(r => r.id === tempId)
    if (index !== -1) {
      BibliographicReferences.value[index] = newRef
      // Adiciona na lista inicial para não ser mais considerado "novo"
      initialBibliographicReferences.value.push({ ...newRef })
    }
    
    toast.add({ title: 'Success', description: 'Referência salva com sucesso.', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao salvar referência.', color: 'error' })
  }
}

const updateTargetFootnote = async (id: string | undefined) => {
  const filteredObj = Footnotes.value.filter((reference) => reference.id == id)[0]
  const updatedDescription = filteredObj?.description
  if (updatedDescription == "") return
  if (updatedDescription === undefined) return
  if (id === undefined) return

  try {
    const response = await updateFootnote(String(id), updatedDescription)
    toast.add({ title: 'Success', description: 'Nota de rodapé atualizada com sucesso.', color: 'success' })
    
    // Update the initial list as well to keep them in sync after a successful update
    const initialIndex = initialFootnotes.value.findIndex(r => r.id === id)
    const initialItem = initialFootnotes.value[initialIndex]
    if (initialItem && updatedDescription !== undefined) {
      initialItem.description = updatedDescription
    }
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao atualizar nota de rodapé.', color: 'error' })
  }
}

const removeFootnote = async (id: string | undefined) => {
  if (id === undefined) return
  if (Number(id) < 0) {
    Footnotes.value = Footnotes.value.filter(r => r.id !== id)
    return
  }

  try {
    await deleteFootnote(String(id))
    toast.add({ title: 'Success', description: 'Nota de rodapé removida com sucesso.', color: 'success' })
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao remover nota de rodapé.', color: 'error' })
  }
}

const saveNewFootnote = async (tempId: string | undefined) => {
  const targetFootnote = Footnotes.value.find(r => r.id === tempId)
  if (!targetFootnote) return

  try {
    const newRef = await createFootnote({
      post_id: String(postId),
      description: targetFootnote.description
    })
    
    // Substitui o item temporário pelo item retornado do backend
    const index = Footnotes.value.findIndex(r => r.id === tempId)
    if (index !== -1) {
      Footnotes.value[index] = newRef
      // Adiciona na lista inicial para não ser mais considerado "novo"
      initialFootnotes.value.push({ ...newRef })
    }
    
    toast.add({ title: 'Success', description: 'Nota de rodapé salva com sucesso.', color: 'success' })
  } catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Erro ao salvar nota de rodapé.', color: 'error' })
  }
}

</script>
      
<template>
<UPageBody class="w-full" >
  <UContainer >
    <UPageHeader title="Editar Post"  />
  </UContainer>
  <UForm :validate="validate" :state="state" class="generic_form"   @submit="onSubmit" >
    <UContainer >
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Editar Post</h2>
        </template>

        <UFormField label="Status" name="status" class="mb-5" :ui="{ label: 'custom-label' }">
          <USelect v-model="state.status" :items="statusOptions" class="w-full" />
        </UFormField>
        
        <UFormField label="Título" name="title" class="mb-5" :ui="{ label: 'custom-label' }">
          <UInput v-model="state.title" variant="subtle"  placeholder="Digite o título do post" class="w-full" />
        </UFormField>
        
        <UFormField label="Autor" name="author" class="mb-5" :ui="{ label: 'custom-label' }">
          <USelect v-model="state.author" :items="authorOptions" class="w-full" />
        </UFormField>

        <UFormField label="Resuma o contéúdo do post em poucas palavras" name="tldr" class="mb-5" :ui="{ label: 'custom-label' }">
          <UTextarea v-model="state.tldr" color="neutral" variant="subtle" placeholder="Resumo..." class="w-full"/>
        </UFormField>
        
        <UFormField label="Imagem de capa" name="imagePath" class="mb-5" :ui="{ label: 'custom-label' }">
          <!-- Show existing image if available -->
            <div v-if="currentImageUrl" class="mb-4 current-image">
              <p class="text-sm text-gray-500 mb-2">Imagem atual:</p>
              <img :src="currentImageUrl" alt="Capa atual" class="w-48 h-auto rounded-md shadow-sm" >
            </div>

          <UFileUpload 
            v-model="state.imagePath" 
            accept="image/*" 
            label="Arraste uma nova imagem ou clique para selecionar (substituir)" 
            class="w-full min-h-48"
            description="SVG, PNG, JPG or GIF (max. 2MB)"
            color="primary" 
            highlight />
        </UFormField>

        <UFormField :name="state.formatType === 'HTML' ? 'contentHtml' : 'contentMarkdown'" class="mb-5">
          <template #label>
            <h3 class="custom-label">Conteúdo</h3>
          </template>
          <div v-if="!isLoading">
            <UTabs :items="[{ value: 'HTML', label: 'Rich Text' }, { value: 'MARKDOWN', label: 'Markdown' }]" v-model="state.formatType" class="w-full" />
            
            <div v-if="state.formatType === 'HTML'" class="mt-4">
              <UEditor
                key="post-content-editor"
                v-slot="{ editor }"
                v-model="state.contentHtml"
                :extensions="editorExtensions"
                :handlers="customHandlers"
                content-type="html"
                :ui="{ base: 'p-8 sm:px-16' }"
                class="w-full min-h-74"
                placeholder="Escreva aqui..."
              >
                <UEditorToolbar
                  :editor="editor"
                  :items="items"
                  class="border-b border-muted py-2 px-8 sm:px-16 overflow-x-auto"
                />
              </UEditor>
            </div>
            <div v-else-if="state.formatType === 'MARKDOWN'" class="mt-4">
              <URadioGroup
                v-model="markdownInputMethod"
                :items="[{ value: 'text', label: 'Escrever na tela' }, { value: 'file', label: 'Fazer upload de arquivo .md' }]"
                class="mb-4"
              />
              
              <div v-if="markdownInputMethod === 'text'">
                <UTextarea v-model="state.contentMarkdown" color="neutral" variant="outline" placeholder="Escreva o Markdown aqui..." class="w-full min-h-[300px] font-mono" :rows="15" />
              </div>
              <div v-else>
                <UFileUpload
                  accept=".md"
                  label="Arraste um arquivo markdown ou clique para selecionar"
                  description="Apenas arquivos .md"
                  color="primary"
                  highlight
                  @update:model-value="onMarkdownFileChange"
                />
                <div v-if="state.contentMarkdown" class="mt-4">
                  <h4 class="text-sm font-medium mb-2">Conteúdo carregado:</h4>
                  <UTextarea v-model="state.contentMarkdown" color="neutral" variant="outline" class="w-full min-h-[200px] font-mono" :rows="10" />
                </div>
              </div>
            </div>
          </div>
        </UFormField>
        
        <UFormField label="Categorias" name="categories" class="mb-5" :ui="{ label: 'custom-label' }">
          <USelect v-model="state.categories" :items="categoryOptions" class="w-full" />
        </UFormField>
        <template #footer>
          <UButton icon="i-lucide-save" size="md" type="submit" color="warning">Salvar Post</UButton>
        </template>
      </UCard>
    </UContainer >
  </UForm>

  <UCard>
    <UContainer>
        <UPageFeature as="h2" title="Referências Bibliográficas" class="bg-accented p-3 mb-8" />
        <UContainer v-if="BibliographicReferences.length < 1" class="flex items-center justify-center w-full mb-8">
          Nenhuma referência adicionada
        </UContainer>
        <div v-else class="m-0">
            <UContainer v-for="(referencia, index) in BibliographicReferences" :key="referencia.id">
              <PostReference v-model:description="referencia.description" :title="`Referência ${index + 1}`" />
              <UContainer class="flex items-center justify-center w-full mb-8 gap-4">
                <UButton icon="i-lucide-trash" size="sm" color="error" @click="removeReference(referencia.id)">Remover Referência</UButton>
                <UButton icon="i-lucide-pencil" size="sm" color="info" @click="updateReference(referencia.id)">Atualizar Referência</UButton>
                <div v-if="!initialBibliographicReferences.some(r => r.id === referencia.id)">
                  <UButton icon="i-lucide-save" size="sm" color="warning" @click="saveNewReference(referencia.id)">Salvar Referência</UButton>
                </div>
              </UContainer>
            </UContainer>
        </div>
        <UContainer class="flex items-center justify-center w-full mb-8">
          <UButton icon="i-lucide-square-plus" size="md" color="primary" @click="addReference">Adicionar Nova Referência</UButton>
        </UContainer>

        <UPageFeature as="h2" title="Notas de Rodapé" class="bg-accented p-3 mb-8" />
        <UContainer v-if="Footnotes.length < 1" class="flex items-center justify-center w-full mb-8">
          Nenhuma nota de rodapé adicionada
        </UContainer>
        <div v-else class="m-0">
          <UContainer v-for="(nota, index) in Footnotes" :key="nota.id">
            <PostReference v-model:description="nota.description" :title="`Nota de Rodapé ${index + 1}`" />
             <UContainer class="flex items-center justify-center w-full mb-8 gap-4">
                <UButton icon="i-lucide-trash" size="sm" color="error" @click="removeFootnote(nota.id)">Remover Nota de Rodapé</UButton>
                <UButton icon="i-lucide-pencil" size="sm" color="info" @click="updateTargetFootnote(nota.id)">Atualizar Nota de Rodapé</UButton>
                <div v-if="!initialFootnotes.some(r => r.id === nota.id)">
                  <UButton icon="i-lucide-save" size="sm" color="warning" @click="saveNewFootnote(nota.id)">Salvar Nota de Rodapé</UButton>
                </div>
              </UContainer>
          </UContainer>
        </div>
        <UContainer class="flex items-center justify-center w-full mb-8">
          <UButton icon="i-lucide-square-plus" size="md" color="primary" @click="addFootnote">Adicionar Nova Nota de Rodapé</UButton>
        </UContainer>
    </UContainer >
  </UCard>
</UPageBody>
</template>

<style scoped>
.current-image img {
  width: 100%;
}
</style>


