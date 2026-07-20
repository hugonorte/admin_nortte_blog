<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const token = computed(() => route.query.token as string || '')
const email = computed(() => route.query.email as string || '')

const fields: AuthFormField[] = [{
  name: 'password',
  label: 'Nova Senha',
  type: 'password',
  placeholder: 'Digite sua nova senha',
  required: true
}, {
  name: 'password_confirmation',
  label: 'Confirmar Nova Senha',
  type: 'password',
  placeholder: 'Repita a nova senha',
  required: true
}]

const schema = z.object({
  password: z.string({ required_error: 'A senha é obrigatória' }).min(8, 'A senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string({ required_error: 'A confirmação é obrigatória' })
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!token.value || !email.value) {
    toast.add({
      title: 'Erro de validação',
      description: 'Link de redefinição inválido ou expirado.',
      color: 'error'
    })
    return
  }

  try {
    // Usando $fetch nativo para requisições dinâmicas
    await $fetch('/auth/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        token: token.value,
        password: event.data.password,
        password_confirmation: event.data.password_confirmation
      },
      baseURL: useRuntimeConfig().public.apiBaseUrl
    })

    toast.add({
      title: 'Sucesso!',
      description: 'Senha redefinida com sucesso. Você já pode fazer login.',
      color: 'success'
    })
    
    navigateTo('/')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao redefinir a senha'
    console.error('Falha ao redefinir senha:', errorMessage)
    
    toast.add({
      title: 'Erro na redefinição',
      description: 'Ocorreu um erro ao redefinir a senha. Verifique se o link ainda é válido.',
      color: 'error'
    })
  }
}

function onError(event: any) {
  console.warn('Falha de validação Zod (Redefinir Senha):', event.errors)
}
</script>

<template>
  <div class="loginbox">
    <UPageCard class="w-full max-w-md">
      <div class="logo">
        <Logo class="h-5 w-auto shrink-0" />
      </div>
      
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold mb-2">Redefinir Senha</h1>
        <p class="text-sm text-gray-500">Crie uma nova senha para sua conta.</p>
      </div>

      <UAuthForm
        :schema="schema"
        :fields="fields"
        :submit="{
          label: 'Redefinir e Entrar',
        }"
        @submit="onSubmit"
        @error="onError"
      />
      
      <div class="mt-4 text-center">
        <NuxtLink to="/" class="text-sm text-primary hover:underline">
          Cancelar e voltar
        </NuxtLink>
      </div>
    </UPageCard>
  </div>
</template>

<style scoped lang="scss">
.loginbox {
 width: 100vw;
 height:100vh;
 display:flex;
 align-items:center;
 justify-content:center;
}
.logo {
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:20px;
}
</style>
