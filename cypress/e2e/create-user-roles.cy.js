describe('User Creation Form - Roles Select', () => {
  beforeEach(() => {
    // Intercept the roles API request
    cy.intercept('GET', '**/roles', {
      statusCode: 200,
      body: [
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'user', label: 'Usuário' },
        { value: 'author', label: 'Autor' }
      ]
    }).as('getRoles')

    cy.loginAdmin()
    
    // Visit the creation page
    cy.visit('/admin/user/create')
  })

  it('should fetch roles and display them in the select dropdown', () => {
    // Check if we got redirected
    cy.url().should('include', '/admin/user/create')

    // USelect renders a native select element
    cy.get('select').should('exist')

    // Verify the dropdown options are rendered correctly (placeholder + 4 options = 5)
    cy.get('select option').should('have.length.at.least', 4)
    cy.get('select option').contains('Administrador').should('exist')
    cy.get('select option').contains('Editor').should('exist')
    cy.get('select option').contains('Usuário').should('exist')
    cy.get('select option').contains('Autor').should('exist')
  })
})
