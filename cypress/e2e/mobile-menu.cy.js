describe('Mobile Navigation Menu', () => {
  beforeEach(() => {
    // Set viewport to mobile size (iPhone 6/7/8)
    cy.viewport(375, 667)

    // Intercept client-side requests if necessary
    cy.intercept('GET', '**/user', {
      statusCode: 200,
      body: {
        data: [{ id: 1, first_name: 'Test', role: 'admin' }]
      }
    }).as('getUser')

    // Visit the admin dashboard
    cy.visit('/admin/dashboard')
  })

  it('should open the slideover menu when hamburger button is clicked', () => {
    // The mobile header should be visible on small screens
    cy.get('.mobile-header').should('be.visible')
    
    // Click the UDashboardSidebarToggle button (which renders as a button)
    cy.get('.mobile-header button').should('exist').click({ force: true })

    // After clicking, the slideover/menu dialog should become visible
    cy.get('[role="dialog"]').should('exist').and('be.visible')
  })
})
