describe('Post Edit Flow', () => {
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

      cy.intercept('GET', '**/post', {
        statusCode: 200,
        body: {
          content: [
            { id: 1, title: 'Post Teste', authorName: 'Autor', category: { id: 'c1', name: 'Cat' }, createdAt: '2023-01-01', status: 'published' }
          ],
          totalPages: 1
        }
      }).as('getPosts')

      cy.intercept('GET', '**/post/1', {
        statusCode: 200,
        body: { 
          id: 1, 
          title: 'Post Teste', 
          content: '<p>Edit me</p>', 
          tldr: 'Resumo original',
          status: 'published',
          authorId: 1,
          category: { id: 'c1', name: 'Cat' },
          imagePath: '/images/test.jpg'
        }
      }).as('getPostDetail')

      cy.intercept('GET', '**/author*', {
        statusCode: 200,
        body: { content: [{ id: 1, name: 'Hugo Norte' }] }
      }).as('getAuthors')

      cy.intercept('GET', '**/category*', {
        statusCode: 200,
        body: { content: [{ id: 'c1', name: 'Tech' }] }
      }).as('getCategories')

      cy.intercept('GET', '**/bibliographicReference*', { statusCode: 200, body: [] })
      cy.intercept('GET', '**/footnote*', { statusCode: 200, body: [] })

      cy.intercept('PUT', '**/post/1', {
        statusCode: 200,
        body: { id: 1, title: 'Título Atualizado pelo Cypress' }
      }).as('updatePost')

      cy.intercept('PATCH', '**/post/1/status*', {
        statusCode: 200,
        body: { id: 1, status: 'draft', title: 'Post Teste' }
      }).as('updatePostStatus')

      cy.intercept('POST', '**/upload', {
        statusCode: 200,
        body: { path: '/fake-path/new-image.jpg' }
      }).as('uploadFile')
    }
  })

  it('should navigate to the edit post page, edit fields, and save', () => {
    cy.visit('/')
    cy.get('input[name="email"]', { timeout: 30000 }).should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_EMAIL'))
    cy.get('input[name="password"]').should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_PASSWORD'))
    cy.contains('button', 'Fazer Login').click()

    cy.url().should('include', '/admin/dashboard')

    cy.contains('Posts').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')

    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.contains('a', 'Editar').should('be.visible')
    cy.contains('a', 'Editar').first().click()

    cy.url({ timeout: 15000 }).should('match', /\/admin\/posts\/[a-zA-Z0-9-]+$/)

    // Verifica se os campos foram preenchidos
    if (Cypress.env('MOCK_API')) {
      cy.get('input[name="title"]').should('have.value', 'Post Teste')
      cy.get('textarea[name="tldr"]').should('have.value', 'Resumo original')
    } else {
      cy.get('input[name="title"]').should('not.have.value', '')
      cy.get('textarea[name="tldr"]').should('not.have.value', '')
    }

    // Limpa os campos e insere novos dados
    const timestamp = Date.now()
    cy.get('input[name="title"]').clear().type(`Título Atualizado pelo Cypress ${timestamp}`)
    cy.get('textarea[name="tldr"]').clear().type('Resumo modificado')

    // Atualiza o editor de conteúdo Tiptap
    cy.get('.ProseMirror').should('be.visible').clear().type('Conteúdo modificado pelo teste Cypress')

    // Salva o post
    cy.contains('button', 'Salvar Post').click()
    
    if (Cypress.env('MOCK_API')) {
      cy.wait('@updatePost')
    }

    // Verifica se salvou com sucesso e voltou para a listagem
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')
    cy.contains('Post atualizado com sucesso.').should('be.visible')
  })

  it('should change post status from published to draft and persist the change', () => {
    cy.visit('/')
    cy.get('input[name="email"]', { timeout: 30000 }).should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_EMAIL'))
    cy.get('input[name="password"]').should('be.visible').type(Cypress.env('NUXT_ADMIN_USER_PASSWORD'))
    cy.contains('button', 'Fazer Login').click()

    cy.url().should('include', '/admin/dashboard')

    // Navigate to posts list
    cy.contains('Posts').should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')

    // Click on the first edit button to open the post editor
    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.contains('a', 'Editar').should('be.visible')
    cy.contains('a', 'Editar').first().click()

    cy.url({ timeout: 15000 }).should('match', /\/admin\/posts\/[a-zA-Z0-9-]+$/)

    // Verify the post is loaded with published status
    if (Cypress.env('MOCK_API')) {
      cy.get('[name="status"]').parent().find('[role="combobox"]').should('contain', 'Publicado')
    } else {
      cy.get('[name="status"]').parent().find('[role="combobox"]').should('be.visible')
    }

    // Change status from published to draft
    cy.get('[name="status"]').parent().find('[role="combobox"]').click()
    cy.contains('li', 'Rascunho').click()

    // Verify status changed in the UI
    cy.get('[name="status"]').parent().find('[role="combobox"]').should('contain', 'Rascunho')

    // Save the post
    cy.contains('button', 'Salvar Post').click()

    if (Cypress.env('MOCK_API')) {
      cy.wait('@updatePost')
      cy.wait('@updatePostStatus')
    }

    // Verify success message and navigation back to posts list
    cy.contains('Post atualizado com sucesso.').should('be.visible')
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')

    // Optionally: Click back on the same post to verify status persisted
    cy.contains('a', 'Editar').first().click()
    cy.url({ timeout: 15000 }).should('match', /\/admin\/posts\/[a-zA-Z0-9-]+$/)

    if (Cypress.env('MOCK_API')) {
      cy.get('[name="status"]').parent().find('[role="combobox"]').should('contain', 'Rascunho')
    } else {
      cy.get('[name="status"]').parent().find('[role="combobox"]').should('be.visible')
    }
  })
})
