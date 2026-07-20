describe('Author Edit', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { token: 'fake-token', id: '1', name: 'Test', email: 'admin@example.com', role: 'admin' }
    }).as('login')

    cy.intercept('POST', '**/auth/refresh', {
      statusCode: 200,
      body: { accessToken: 'fake-token', tokenType: 'bearer' }
    }).as('refreshToken')

    cy.intercept('POST', '**/auth/me', {
      statusCode: 200,
      body: { id: 1, first_name: 'Test', role: 'admin' }
    }).as('getUser')

    cy.visit('/')

    // Wait for the login page to load properly, Nuxt UI might take a bit
    cy.get('input[type="email"]', { timeout: 15000 }).should('be.visible').type('admin@example.com')
    cy.get('input[type="password"]', { timeout: 15000 }).should('be.visible').type('password123')
    cy.contains('button', 'Fazer Login').click()

    // Should redirect to dashboard client-side
    cy.url({ timeout: 10000 }).should('include', '/admin/dashboard')
  })

  it('should successfully edit an author', () => {
    // Intercept the GET author request to mock the list of authors
    cy.intercept('GET', '**/api/author', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Author One', email: 'author1@test.com' }
      ]
    }).as('getAuthors');

    // Visit the author index page
    cy.visit('/admin/author')
    
    cy.wait('@getAuthors', { timeout: 10000 });

    // Register the getAuthor intercept BEFORE clicking the link
    cy.intercept('GET', '**/api/author/1', {
      statusCode: 200,
      body: { data: { id: 1, name: 'Author One', email: 'author1@test.com', bio: 'Bio 1', main_title: 'Title 1', preferred_social_network: 'X', preferred_social_network_username: '@author1' } }
    }).as('getAuthor');

    // Click the edit button link for author with ID 1
    cy.get('table').find('a[href="/admin/author/1"]').first().click();

    // Verify the URL changed to an ID (and not NaN)
    cy.url().should('not.include', 'NaN');
    cy.url().should('match', /\/admin\/author\/\d+/);

    // Wait for the author data to load
    cy.wait('@getAuthor', { timeout: 10000 });

    // Make an edit
    cy.get('input[name="name"]').clear().type('Edited Author Name');

    // Intercept the PATCH request
    cy.intercept('PATCH', '**/api/author/1', {
      statusCode: 200,
      body: { id: 1, name: 'Edited Author Name', email: 'author1@test.com', bio: 'Bio 1', main_title: 'Title 1', preferred_social_network: 'X', preferred_social_network_username: '@author1' }
    }).as('updateAuthor');
    
    // Submit the form
    cy.get('form').submit();
    
    // Check if the PATCH request was successful
    cy.wait('@updateAuthor').its('response.statusCode').should('eq', 200);

    // Verify redirection back to index
    cy.url().should('include', '/admin/author');
  });
});
