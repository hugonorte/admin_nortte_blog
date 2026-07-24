<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
  
  const toast = useToast()
  const auth = useAuth()

  const fields: AuthFormField[] = [{
    name: 'email',
    type: 'email',
    label: 'E-mail',
    placeholder: 'Digite seu e-mail',
    required: true
  }, {
    name: 'password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite sua senha',
    required: true
  }, {
    name: 'remember',
    label: 'Lembrar-me',
    type: 'checkbox'
  }]

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string({ required_error: 'A senha é obrigatória' }).min(8, 'A senha deve ter pelo menos 8 caracteres')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    // O Nuxt UI retorna os dados validados dentro de 'event.data'
    await auth.login(event.data.email, event.data.password)
    
    navigateTo('/admin/dashboard')
  } catch (error) {
    // Tratamento de erro do Login (ex: senha incorreta no backend)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('Login falhou:', errorMessage)
    
    toast.add({
      title: 'Erro no Login',
      description: 'Verifique suas credenciais.',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="loginbox">
    <UPageCard class="w-full max-w-md">
      <Logo class="h-6 w-auto" />
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :submit="{
          label: 'Fazer Login',
        }"
        @submit="onSubmit"
      />
      <div class="mt-4 text-center">
        <NuxtLink to="/esqueci-senha" class="text-sm text-primary hover:underline">
          Esqueci minha senha
        </NuxtLink>
      </div>
    </UPageCard>
  </div>
</template>

<style scoped>
.loginbox {
 width:100vw;
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