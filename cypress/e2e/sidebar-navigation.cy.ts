describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { access_token: 'fake-token', token_type: 'bearer', expires_in: 3600 }
    }).as('login')

    cy.intercept('POST', '**/auth/me', {
      statusCode: 200,
      body: { id: 1, first_name: 'Test', role: 'admin' }
    }).as('getUser')

    // Visit login page (Server-Side Rendered, but no auth needed)
    cy.visit('/')
  })

  it('should navigate to the Author page when clicking Autores in the sidebar', () => {
    // Perform Login
    cy.get('input[name="email"]').should('be.visible').type('admin@example.com')
    cy.get('input[name="password"]').should('be.visible').type('password123')
    cy.contains('button', 'Fazer Login').click()

    // Wait for intercepts
    cy.wait('@login')
    cy.wait('@getUser')

    // Should redirect to dashboard client-side
    cy.url().should('include', '/admin/dashboard')

    // Navigate to Posts page
    cy.contains('Posts').should('be.visible').click()
    cy.url().should('include', '/admin/posts')
    
    // Go to Create Post page where the bug occurs
    cy.contains('a', 'Criar').should('be.visible').click()
    cy.url().should('include', '/admin/posts/create')

    // Simulate the user discovering they need to register an author
    // and clicking the 'Autores' link in the sidebar
    cy.contains('Autores').should('be.visible').click({ force: true })

    // Verify correct navigation to Author registration/list page
    cy.url().should('include', '/admin/author')
})
})
