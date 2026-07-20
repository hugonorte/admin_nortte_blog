describe('Post Create Flow', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    
    if (Cypress.env('MOCK_API')) {
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { token: 'fake-token', token_type: 'bearer', expires_in: 3600 }
      }).as('login')

      cy.intercept('POST', '**/auth/me', {
        statusCode: 200,
        body: { id: 1, first_name: 'Test', role: 'ADMIN' }
      }).as('getUser')

      cy.intercept('GET', '**/author*', {
        statusCode: 200,
        body: {
          content: [{ id: 1, name: 'Autor Teste' }],
          totalPages: 1,
          totalElements: 1,
          size: 20,
          number: 0
        }
      }).as('getAuthors')

      cy.intercept('GET', '**/category*', {
        statusCode: 200,
        body: {
          content: [{ id: 1, name: 'Categoria Teste' }],
          totalPages: 1,
          totalElements: 1
        }
      }).as('getCategories')

      cy.intercept('POST', '**/post', {
        statusCode: 201,
        body: { id: 1, title: 'Meu Novo Post Cypress' }
      }).as('createPost')

      cy.intercept('POST', '**/upload', {
        statusCode: 200,
        body: { path: '/fake-path/image.jpg' }
      }).as('uploadFile')
    }
  })

  it('should navigate to create post page, fill the form and submit successfully', () => {
    cy.visit('/')
    cy.wait(5000) // Aguarda a compilação do Vite
    
    // Login
    cy.get('input[name="email"]', { timeout: 30000 })
      .should('be.visible')
      .type(Cypress.env('NUXT_ADMIN_USER_EMAIL') || 'admin@example.com')
      
    cy.get('input[name="password"]')
      .should('be.visible')
      .type(Cypress.env('NUXT_ADMIN_USER_PASSWORD') || 'password123')
      
    cy.contains('button', 'Fazer Login').click()

    if (Cypress.env('MOCK_API')) {
      cy.wait('@login')
      cy.wait('@getUser')
    }

    cy.url().should('include', '/admin/dashboard')

    // Navegar pela UI para não causar hard reload e perder o estado em memória (useState token)
    cy.contains('Posts').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')
    cy.contains('Criar Novo post').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts/create')

    // Esperar a página carregar
    cy.get('input[name="title"]').should('be.visible')

    // Preencher o formulário
    const timestamp = new Date().getTime()
    cy.get('input[name="title"]').type(`Meu Novo Post Cypress ${timestamp}`)
    
    // Selecionar autor e categoria (Seleciona a primeira option válida)
    cy.get('select[name="author"]').find('option').eq(1).then($option => {
      cy.get('select[name="author"]').select($option.val() as string, { force: true })
    })

    cy.get('textarea[name="tldr"]').type('Este é um resumo gerado pelo Cypress')
    
    // Mockar ou fazer upload da imagem
    cy.get('input[type="file"]').first().selectFile({
      contents: Cypress.Buffer.from('conteúdo fictício da imagem'),
      fileName: 'imagem-teste.png',
      mimeType: 'image/png'
    }, { force: true })

    // Escrever no editor do Tiptap
    cy.get('.ProseMirror').should('be.visible').type('Conteúdo principal do post escrito no editor Tiptap pelo Cypress.')
    
    cy.get('select[name="categories"]').find('option').eq(1).then($option => {
      cy.get('select[name="categories"]').select($option.val() as string, { force: true })
    })

    // Submeter o formulário
    cy.contains('button', 'Salvar Post').click()

    if (Cypress.env('MOCK_API')) {
      cy.wait('@createPost')
    }

    // Verificar se houve redirecionamento para a lista de posts após salvar com sucesso
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')
    cy.contains('Post criado com sucesso.').should('be.visible')
  })

  it('should navigate to create post page, write markdown and submit successfully', () => {
    cy.visit('/')
    cy.wait(5000)
    
    // Login
    cy.get('input[name="email"]', { timeout: 30000 }).should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_EMAIL') || 'admin@example.com')
    cy.get('input[name="password"]').should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_PASSWORD') || 'password123')
    cy.contains('button', 'Fazer Login').click()

    if (Cypress.env('MOCK_API')) {
      cy.wait('@login')
      cy.wait('@getUser')
    }

    cy.contains('Posts').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')
    cy.contains('Criar Novo post').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts/create')

    cy.get('input[name="title"]').should('be.visible')

    const timestamp = new Date().getTime()
    cy.get('input[name="title"]').type(`Meu Novo Post Markdown ${timestamp}`)
    
    cy.get('select[name="author"]').find('option').eq(1).then($option => {
      cy.get('select[name="author"]').select($option.val() as string, { force: true })
    })

    cy.get('textarea[name="tldr"]').type('Este é um resumo gerado pelo Cypress para markdown')
    
    cy.get('input[type="file"]').first().selectFile({
      contents: Cypress.Buffer.from('conteúdo fictício da imagem'),
      fileName: 'imagem-teste.png',
      mimeType: 'image/png'
    }, { force: true })

    // Change to Markdown Tab
    cy.contains('button', 'Markdown').click()
    
    // Write Markdown content
    cy.get('textarea[placeholder="Escreva o Markdown aqui..."]').type('# Título Markdown\nEste conteúdo foi escrito no modo Markdown.')
    
    cy.get('select[name="categories"]').find('option').eq(1).then($option => {
      cy.get('select[name="categories"]').select($option.val() as string, { force: true })
    })

    cy.contains('button', 'Salvar Post').click()

    if (Cypress.env('MOCK_API')) {
      cy.wait('@createPost')
    }

    cy.url({ timeout: 15000 }).should('include', '/admin/posts')
    cy.contains('Post criado com sucesso.').should('be.visible')
  })
})
