# Especificação Técnica: Frontend do Painel Abertamente.net

## Visão Geral do Produto
O objetivo deste projeto é construir a interface (Frontend) do painel administrativo para o portal de conteúdo (Blog) https://abertamente.net. Este sistema atuará como cliente de uma API RESTful desenvolvida em Java (Spring Boot 3+). Não se trata apenas de um CRUD, mas de uma plataforma corporativa com controle rigoroso de fluxo editorial, rastreabilidade e alta performance, exigindo uma UI/UX fluida e consistente.

O método de desenvolvimento baseia-se em testes rigorosos (TDD). A arquitetura prioriza a clareza, forte tipagem e comunicação previsível com o backend Java. Devem ser observadas boas práticas como SOLID, DRY, Clean Code e padrões estritos do Vue.js.

## 1. Arquitetura Base e Infraestrutura
- **Framework**: Nuxt 3 com Vue 3 (Composition API obrigatória).
- **Linguagem**: TypeScript (Strict Typing, sem `any`).
- **Build Tool**: Nuxt (Nitro / Vite).
- **Roteamento**: File-based routing do Nuxt (`pages/`).
- **Integração com Backend Java**: Toda a comunicação com o Spring Boot DEVE usar `$fetch` / `ofetch` ou os composables `useFetch` / `useAsyncData` do Nuxt. As requisições devem respeitar os contratos de DTOs (Data Transfer Objects) definidos na API REST Java. É proibido vazar objetos globais do DOM (SSG Safety).

## 2. Segurança e Autenticação (Integração Spring Security)
O frontend consumirá regras rígidas de segurança definidas pelo Spring Security.
- **Autenticação (JWT)**: Baseada em tokens JWT Stateless. O frontend deve gerenciar de forma segura os access tokens e refresh tokens.
- **Autorização (Roles)**: O acesso às rotas (Middlewares do Nuxt) e a exibição de componentes da UI devem ser condicionados às *roles* injetadas pelo JWT do Java (ex: `ROLE_ADMIN`, `ROLE_AUTHOR`).
- **Interceptors**: Utilizar plugins do Nuxt para interceptar respostas (ex: erro 401 Unauthorized para renovação do token, 403 Forbidden para bloqueio de tela) provindas do Spring Boot.

## 3. Máquina de Estados e Fluxo Editorial
O backend gerencia os estados do ciclo de vida de uma publicação (Aberto, Em Desenvolvimento, Concluído, Publicado, Editado, Cancelado) via Enums. 
- O frontend deve refletir esses estados visualmente e aplicar validações prévias na interface, bloqueando transições ou cliques em botões para fluxos inválidos (melhorando a UX), mas sempre enviando requisições consistentes ao Java.
- Quando o estado atinge "Publicado", componentes de indexação de SEO e monetização devem ser ativados na UI.

## 4. Padronização de Erros e Comunicação
A API Java implementa o *Global Exception Handling* com retornos JSON padronizados (contendo código, mensagem e detalhes).
- O frontend deve estar preparado para processar a estrutura de erro do Spring (ex: `ProblemDetail` ou padrão DTO próprio) e exibir alertas não bloqueantes e amigáveis ao usuário, sem nunca revelar stack traces.
- **Validações Client-Side**: O frontend fará validação prévia de todos os formulários usando `vee-validate` + `zod` em estrita paridade com a validação *Jakarta Bean Validation* (`@Valid`) do Java, garantindo duplo callback obrigatório para tratar falhas e envio.

## 5. Gerenciamento de Estado e Validação
- **Estado Global**: Utilizar apenas Composables globais com o hook `useState` do Nuxt (Pinia está proibido).
- **Estado Local**: Usar `ref` ou `reactive` no `<script setup>`.
- **Auditoria e Logs**: Ações destrutivas na UI devem sempre invocar os logs de negócio primeiro. O frontend enviará informações para a API (e dependerá do Spring Data JPA Auditing via contexto do JWT). Interações bloqueantes (`alert()`, `confirm()`) só podem ser renderizadas após as chamadas de auditoria.

## 6. Design, Estilização e UI
- **Padrão Majoritário**: SCSS em `<style scoped lang="scss">`.
- **Padrão Utilitário**: Tailwind CSS v4 para os componentes padrão do NUXT UI.
- **Responsividade**: Arquitetura Mobile First obrigatória, usando breakpoints e mixins do sistema via `@use` (nunca pixels estáticos inline).
- **Internacionalização (i18n)**: Textos hardcoded na interface estão estritamente proibidos.

## 7. Testes e Qualidade (TDD)
O desenvolvimento TDD é inegociável para garantir entregas estáveis e validar os contratos complexos com o backend Java.
- **Testes Unitários**: Vitest (Lógica isolada, utilitários, composables).
- **Testes End-to-End (E2E)**: Cypress (Fluxos completos, telas e formulários). Todas as novas telas ou regras de negócio importadas do Spring Boot precisam de cobertura de teste no lado do cliente.