<script setup lang="ts">
import type { FormError, FormSubmitEvent,
  EditorCustomHandlers, 
  EditorSuggestionMenuItem, 
  EditorMentionMenuItem, 
  EditorEmojiMenuItem, 
  EditorToolbarItem,
  DropdownMenuItem
 } from '@nuxt/ui'
import PostReference from '~/components/PostReference.vue';
import type { BibliographicReference, Footnote, Author , Category  } from '~/types/models';
import { fetchAuthors } from '~/api/author/get'
import { fetchCategories } from '~/api/category/get'
import { createPost } from '~/api/post/post'
import { uploadFile } from '~/api/upload/upload'
import { ref, computed, markRaw } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import ImageUploadExtension from './EditorImageUploadExtension'
import { createBibliographicReferences } from '~/api/bibliographicReference/post';
import { createFootnote } from '~/api/footnote/post';

// Use markRaw to prevent Vue's reactivity system from wrapping Tiptap objects
const editorExtensions = markRaw([markRaw(ImageUploadExtension)])

const customHandlers = markRaw({
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: () => false
  }
}) satisfies EditorCustomHandlers

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const isLoading = ref<boolean>(false)
const Authors = ref<Author[]>([])
const Categories = ref<Category[]>([])

onMounted(async () => {
  isLoading.value = true
  try {
    const authorsResponse = await fetchAuthors()
    Authors.value = Array.isArray((authorsResponse as any)?.content) 
        ? (authorsResponse as any).content 
        : (Array.isArray(authorsResponse) ? authorsResponse : [])
    
    const categoriesResponse = await fetchCategories()
    Categories.value = Array.isArray((categoriesResponse as any)?.content) 
        ? (categoriesResponse as any).content 
        : (Array.isArray(categoriesResponse) ? categoriesResponse : [])
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const markdownInputMethod = ref('text')

const state = reactive({
  title: '' as string | undefined,
  tldr: '' as string | undefined,
  contentHtml: '' as string | undefined,
  contentMarkdown: '' as string | undefined,
  formatType: 'HTML' as string,
  categories: undefined as number | undefined,
  imagePath: undefined as any,
  author: undefined as number | undefined,
})



type Schema = typeof state

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.title) errors.push({ name: 'title', message: 'O título do post é um campo obrigatório' })
  if (!state.tldr) errors.push({ name: 'tldr', message: 'O resumo do post é um campo obrigatório' })
  if (state.formatType === 'HTML' && !state.contentHtml) errors.push({ name: 'contentHtml', message: 'O conteúdo do post é um campo obrigatório' })
  if (state.formatType === 'MARKDOWN' && !state.contentMarkdown) errors.push({ name: 'contentMarkdown', message: 'O conteúdo do post é um campo obrigatório' })
  if (!state.categories || state.categories === undefined) errors.push({ name: 'categories', message: 'Pelo menos uma categoria deve ser selecionada' })
  if (!state.imagePath) errors.push({ name: 'imagePath', message: 'A imagem do post é um campo obrigatório' })
  if (!state.author) errors.push({ name: 'author', message: 'O autor do post é um campo obrigatório' })
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

// Example categories for the input menu ## Alterar para buscar do backend
const categoryOptions = computed(() => 
  Categories.value.map((category) => ({ label: category.name, value: category.id }))
)

const toast = useToast()
const bibliographicReferences = reactive<BibliographicReference[]>([])
const footnotes = reactive<Footnote[]>([])

const addReference = () => {
  bibliographicReferences.push(
    { 
      id: String(bibliographicReferences.length + 1), 
      description: "" 
    }
  )
}

const addFootnote = () => {
  footnotes.push(
    { 
      id: String(footnotes.length + 1), 
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
    let imagePathUrl = '';
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
      status: 'draft',
      formatType: state.formatType!
    };

    const post = await createPost(postPayload);

    bibliographicReferences.forEach(async (reference) => {
      await createBibliographicReferences({
        post_id: String(post.id),
        description: reference.description
      })
    })
    footnotes.forEach(async (footnote) => {
      await createFootnote({
        post_id: String(post.id),
        description: footnote.description
      })
    })
    toast.add({ title: 'Success', description: 'Post criado com sucesso.', color: 'success' })
    await navigateTo('/admin/posts')
  } catch (error) {
    console.error(error);
    toast.add({ title: 'Error', description: 'Erro ao criar post.', color: 'error' })
  }
}
</script>

<template>
  <UPageBody class="w-full" >
    <UContainer >
      <UPageHeader title="Criar Post"  />
    </UContainer>
    <UForm :validate="validate" :state="state" class="generic_form"   @submit="onSubmit" >
      <UContainer >
        <UCard>
          <template #header>
            <h2 class="text-lg font-medium">Novo Post</h2>
          </template>


          <UFormField label="Título" name="title" class="mb-5" :ui="{ label: 'custom-label' }">
            <UInput v-model="state.title" variant="subtle"  placeholder="Digite o título do post" class="w-full" />
          </UFormField>
          
          <UFormField label="Autor" name="author" class="mb-5" :ui="{ label: 'custom-label' }">
            <USelect v-model="state.author" :items="authorOptions" class="w-full" />
          </UFormField>

          <UFormField label="Resuma o contéúdo do post em poucas palavras" name="tldr" class="mb-5" :ui="{ label: 'custom-label' }">
            <UTextarea v-model="state.tldr" color="neutral" variant="subtle" placeholder="Resumo..." class="w-full"/>
          </UFormField>
          
          <UFormField label="Imagem de capa" name="imagePath" class="mb-8" :ui="{ label: 'custom-label' }">
            <UFileUpload 
              v-model="state.imagePath" 
              accept="image/*" 
              label="Arraste uma imagem ou clique para selecionar" 
              class="w-full min-h-48"
              description="SVG, PNG, JPG or GIF (max. 2MB)"
              color="primary" 
              highlight />
          </UFormField>


          <UFormField :name="state.formatType === 'HTML' ? 'contentHtml' : 'contentMarkdown'" class="mb-5">
            <template #label>
              <h3 class="custom-label">Conteúdo</h3>
            </template>
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
          </UFormField>
          
          <UFormField label="Categorias" name="categories" class="mb-5" :ui="{ label: 'custom-label' }">
            <USelect v-model="state.categories" :items="categoryOptions" class="w-full" />
          </UFormField>

           <UPageFeature :ui="{ title: 'custom-label' }" as="h2" title="Referências Bibliográficas" class="bg-accented p-3 mb-8" />
           <UContainer v-if="bibliographicReferences.length < 1" class="flex items-center justify-center w-full mb-8">
            Nenhuma referência adicionada
           </UContainer>
           <div v-else class="m-0">
            <UContainer v-for="(referencia, index) in bibliographicReferences" :key="index">
              <PostReference v-model:description="referencia.description" :title="`Referência ${index + 1}`" />
            </UContainer>
           </div>
           <UContainer class="flex items-center justify-center w-full mb-8">
             <UButton icon="i-lucide-square-plus" size="md" color="primary" @click="addReference">Adicionar Nova Referência</UButton>
           </UContainer>


           <UPageFeature :ui="{ title: 'custom-label' }" as="h2" title="Notas de Rodapé" class="bg-accented p-3 mb-8" />
           <UContainer v-if="footnotes.length < 1" class="flex items-center justify-center w-full mb-8">
            Nenhuma nota de rodapé adicionada
           </UContainer>
           <div v-else class="m-0">
            <UContainer v-for="(nota, index) in footnotes" :key="index">
              <PostFootnote v-model:description="nota.description" :title="`Nota de Rodapé ${index + 1}`" />
            </UContainer>
           </div>
           <UContainer class="flex items-center justify-center w-full mb-8">
             <UButton icon="i-lucide-square-plus" size="md" color="primary" @click="addFootnote">Adicionar Nova Nota de Rodapé</UButton>
           </UContainer>

           <template #footer>
            <UButton icon="i-lucide-save" size="md" type="submit" color="warning">Salvar Post</UButton>
          </template>
        </UCard>
      </UContainer>
    </UForm>
  </UPageBody>
</template>

