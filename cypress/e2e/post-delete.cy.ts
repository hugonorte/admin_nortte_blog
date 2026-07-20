describe('Post Delete Flow', () => {
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

      // Mock the initial posts list
      cy.intercept('GET', '**/api/post', {
        statusCode: 200,
        body: {
          content: [
            { 
              id: '123e4567-e89b-12d3-a456-426614174000', 
              title: 'Post to Delete', 
              status: 'published',
              authorName: 'Author Test'
            }
          ],
          totalPages: 1,
          totalElements: 1
        }
      }).as('getPosts')

      // Mock the delete call
      cy.intercept('DELETE', '**/post/123e4567-e89b-12d3-a456-426614174000', {
        statusCode: 204
      }).as('deletePost')
      
      // Mock the refreshed posts list after deletion
      cy.intercept('GET', '**/post*', (req) => {
        // Se a chamada de deleção já foi feita, retorne lista vazia
        // Como o cypress não tem state nativo simples no intercept estático, podemos usar aliases ou simplesmente retornar vazio se for a segunda chamada.
        // Vamos apenas usar a interceptação estática e o Nuxt UI vai atualizar a tabela.
        // Para simplificar, o mock sempre retorna vazio na segunda vez.
      }).as('getPostsRefreshed')
    }
  })

  it('should navigate to posts, open delete modal, and delete the post', () => {
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

    // Navigate to Posts
    cy.get('a[href="/admin/posts"]').first().should('be.visible').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/posts')

    if (Cypress.env('MOCK_API')) {
      cy.wait('@getPosts')
    }
    
    // Override the GET posts intercept to return an empty list for the refresh call
    if (Cypress.env('MOCK_API')) {
      cy.intercept('GET', '**/api/post', {
        statusCode: 200,
        body: { content: [], totalPages: 0, totalElements: 0 }
      }).as('getPostsEmpty')
    }

    // Verify the post is in the table (Mock ou DB real se existir algum)
    // Clica no botão de deletar do primeiro post encontrado
    // Usamos o seletor da classe de ícone ou procuramos o botão pai
    cy.get('.delete-post-btn').first().click()

    // O modal deve aparecer
    cy.contains('Confirmar Exclusão').should('exist')
    cy.contains('Você tem certeza que deseja excluir este post?').should('exist')

    // Clica no botão de confirmar exclusão
    cy.contains('button', 'Excluir Post').click({ force: true })

    if (Cypress.env('MOCK_API')) {
      cy.wait('@deletePost')
      cy.wait('@getPostsEmpty')
    }

    // Modal deve sumir
    cy.contains('Confirmar Exclusão').should('not.exist')
    
    // Toast de sucesso
    cy.contains('Post excluído com sucesso').should('be.visible')
  })
})
