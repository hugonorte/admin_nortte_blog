<script setup lang="ts">
import type { FormError, FormSubmitEvent,
  EditorCustomHandlers, 
  EditorSuggestionMenuItem, 
  EditorMentionMenuItem, 
  EditorEmojiMenuItem, 
  DropdownMenuItem
 } from '@nuxt/ui'

 type EditorToolbarItem =
  | { kind: 'mark'; mark: string; icon: string }
  | { kind: 'heading'; level: number; icon: string }
  | { kind: 'textAlign'; align: string; icon: string }
  | { kind: 'bulletList'; icon: string }
  | { kind: 'orderedList'; icon: string }
  | { kind: 'blockquote'; icon: string }
  | { kind: 'link'; icon: string }
  | { kind: 'codeBlock'; icon: string }

const items: EditorToolbarItem[] = [
  { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
  { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
  { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
  { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
  { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
  { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
  { kind: 'bulletList', icon: 'i-lucide-list' },
  { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
  { kind: 'blockquote', icon: 'i-lucide-quote' },
  { kind: 'link', icon: 'i-lucide-link' },
  { kind: 'codeBlock', icon: 'i-lucide-code-xml' },
  { kind: 'mark', mark: 'code', icon: 'i-lucide-code' }
]

const editorContent = defineModel('editorContent', { type: String })
</script>

 <template>
    <UFormField label="Conteúdo completo do post" name="content" class="mb-5">
        <UEditor v-slot="{ editor }" v-model="editorContent" content-type="markdown" class="min-h-[300px] border border-gray-300 rounded">
            <UEditorToolbar :editor="editor" :items="items" />
        </UEditor>
    </UFormField>
 </template>

 