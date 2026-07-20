<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'E-mail',
  placeholder: 'Digite seu e-mail cadastrado',
  required: true
}]

const schema = z.object({
  email: z.string().email('E-mail inválido')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    // Usando $fetch nativo para requisições que não devem ser oxidadas ou se aproveitar de cache SSR
    await $fetch('/auth/forgot-password', {
      method: 'POST',
      body: { email: event.data.email },
      baseURL: useRuntimeConfig().public.apiBaseUrl
    })

    toast.add({
      title: 'Solicitação enviada',
      description: 'Se o e-mail existir em nossa base de dados, um link de recuperação foi enviado.',
      color: 'success'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Falha ao solicitar recuperação:', errorMessage)
    
    toast.add({
      title: 'Aviso',
      description: 'Se o e-mail existir em nossa base de dados, um link de recuperação foi enviado.',
      color: 'success'
    })
  }
}

function onError(event: any) {
  console.warn('Falha de validação Zod (Esqueci Senha):', event.errors)
}
</script>

<template>
  <div class="loginbox">
    <UPageCard class="w-full max-w-md">
      <div class="logo">
        <Logo class="h-5 w-auto shrink-0" />
      </div>
      
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold mb-2">Esqueci minha senha</h1>
        <p class="text-sm text-gray-500">Informe seu e-mail para receber as instruções de recuperação.</p>
      </div>

      <UAuthForm
        :schema="schema"
        :fields="fields"
        :submit="{
          label: 'Enviar instruções',
        }"
        @submit="onSubmit"
        @error="onError"
      />
      
      <div class="mt-4 text-center">
        <NuxtLink to="/" class="text-sm text-primary hover:underline">
          Voltar para o login
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
