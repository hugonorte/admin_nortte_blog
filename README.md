# 📝 Nortte Blog - Painel Admin

Um portal moderno de artigos e conhecimento construído com as mais recentes tecnologias web, focado em performance extrema e otimização SEO. O Nortte Blog utiliza Static Site Generation (SSG) para entregar conteúdo ultrarrápido aos leitores.

---

## 🎯 Sobre o Projeto

O **Nortte Blog Painel Admin** é a interface de administração que combina:
- **Frontend robusto**: SPA construído com Nuxt 3 e Vue 3 Composition API.
- **Backend corporativo**: Comunica-se com uma API oficial via REST.
- **UX/UI Moderno**: Utilizando Tailwind CSS v4 para a renderização de componentes base do Nuxt UI, e SCSS como tecnologia primária e mandatória de estilização customizada.

O projeto foca fortemente em:
- 🔒 **Segurança & Governança**: Validações estritas de ações destrutivas (com modais de dupla verificação) e proibição absoluta de vazamento de credenciais ou dados sensíveis de usuários em logs de produção.
- 📱 **Responsividade**: Arquitetura estritamente Mobile-First sem uso de "magic numbers".
- 🧪 **Test-Driven Development (TDD)**: Testes E2E (Cypress) e unitários (Vitest) são premissas fundamentais e inegociáveis para qualquer entrega.

---

## 🛠️ Stack Frontend

| Tecnologia | Propósito |
|-----------|----------|
| **Nuxt 3** | Meta-framework para infraestrutura e roteamento automático (File-based routing) |
| **Vue 3** | Framework JavaScript (usado estritamente via `<script setup>` - Composition API) |
| **TypeScript** | Tipagem estática rigorosa (o uso de tipagem `any` é terminantemente proibido) |
| **SCSS** | Pré-processador primário de CSS, breakpoints e estilos globais |
| **Tailwind CSS v4** | Utilizado estritamente para renderização dos componentes internos do Nuxt UI |
| **vee-validate + Zod** | Gerenciamento e validação complexa de esquemas de formulários client-side |
| **@nuxtjs/i18n** | Internacionalização (I18n) |
| **Nuxt Composables** | Gerenciamento de estado global da aplicação usando `useState` nativo do Nuxt |
| **Vitest** | Testes Unitários de lógicas isoladas e composables |
| **Cypress** | Testes End-to-End (E2E) em modo headless e interativo de fluxos reais |

### Gerenciador de Pacotes
- **pnpm** (Comandos listados em `package.json`)

---

## 🖥️ Integração com Backend

O sistema se comunica nativamente utilizando clientes HTTP embutidos do Nuxt (`$fetch` ou `useFetch` / `useAsyncData`).
- **Padrões de Comunicação**: Sem implementações manuais de fetcher (`customFetch`). Interceptors são implementados globalmente via Plugins do Nuxt.
- **Autenticação**: JWT com tokens temporários. Nunca se apoie em `useFetch` para ações estritamente pós-login onde o cache de chave/URL possa interceder com dados zumbis de outras sessões; em dados dinâmicos restritos pós-autenticação usa-se `$fetch`.
- **Backend Oficial**: Localizado em `https://github.com/hugonorte/nortte_blog_java_backend`.

---

## 🚀 Setup Local

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- **Node.js**
- **pnpm** (Se não tiver, instale com: `npm install -g pnpm`)
- **Git**

### 1. Clonar o Repositório

```bash
git clone git@github.com:hugonorte/Nortte Blog_paineladmin.git
cd Nortte Blog_paineladmin
```

### 2. Setup e Build

```bash
# 1. Instalar as dependências do projeto
pnpm install

# 2. Copiar arquivo de ambiente
cp .env.example .env

# 3. Rodar a verificação de TypeScript para checar erros tipográficos
pnpm run type-check
```

**Executar ambiente de desenvolvimento:**
```bash
pnpm run dev
```

---

## 📁 Estrutura de Rotas e Estado

- **Rotas (`pages/`)**: O roteamento é resolvido por arquivos. Adicione uma página em `pages/` e a URL existirá. É proibido alterar arquivos físicos de Router.
- **Componentes (`components/`)**: Tirar proveito total do Auto-import do Nuxt. O uso de `import X from '@/components/X.vue'` manual no script é rejeitado por padrão.
- **Estado (`composables/`)**: Bibliotecas terceiras de store como o Pinia são **proibidas**. O gerenciamento de estados globais que exigem reatividade ou SSR-Safety se dá nos Composables consumindo a API nativa `useState` e, para contextos estritamente locais de componente, `ref` ou `reactive`.

---

## 🔧 Comandos Úteis

### Ambiente e Compilação
```bash
pnpm run dev           # Servidor local de desenvolvimento
pnpm run build         # Processo de build e empacotamento Nitro
pnpm run type-check    # Força validação rigorosa de tipagens e interfaces
```

### Testes
```bash
pnpm run cy:open       # Abre UI interativa do Cypress para E2E
npx cypress run        # Roda a suíte completa de Cypress silenciosamente (CI-ready)
pnpm run test          # Bateria de testes de software unitários através do Vitest
```

---

## 📊 Regras Governamentais de Qualidade

1. **TDD Absoluto**: Se existe interface, existe teste. Código enviado sem que a suíte em Cypress/Vitest seja construída previamente não é aprovado.
2. **Zero-Secret Policy**: Nenhum token privado de API ou string de conexão do servidor é comitado. Quaisquer credenciais front-end expostas precisam iniciar obrigatoriamente com o prefixo seguro `NUXT_PUBLIC_`.
3. **Strings Hardcoded Proibidas**: Toda e qualquer palavra exposta ao usuário na tela no template HTML obrigatoriamente deve provir das chamadas `$t('chave')` com traduções definidas nos arquivos de `src/locales/`.
4. **CSS Mobile-First Absoluto**: O uso de Media Queries com "pixels mágicos" (ex: `@media (max-width: 600px)`) é expressamente **proibido**. Utilize o arquivo de abstratos para invocar os mixins da comunidade `@include media-up('md')`.
5. **GitFlow de Lançamento Seguro**: Código novo é instanciado em branches apartadas, testado e fundido impreterivelmente na branch base **`dev`**. Deploys para Master são restritos apenas para lançamentos oficiais de produção homologada.

---

## 🤝 Contribuindo

1. Atualize sua base dev: `git checkout dev && git pull`
2. Crie uma branch para a tarefa: `git checkout -b feature/minha-feature`
3. Crie/Escreva seus testes (Cypress/Vitest) para falharem conscientemente (**RED**)
4. Desenvolva o código tipado em Vue 3 Composition API (**GREEN**)
5. Assegure a verificação estática passando com sucesso em `pnpm run type-check`
6. Envie o commit confirmando que nenhum dado acidental de debug/teste está em `git status`
7. Abra um **Pull Request** apontando unicamente para `dev`.

---

**Última atualização**: Julho de 2026
