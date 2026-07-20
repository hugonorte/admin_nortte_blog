Cypress.Commands.add('loginAdmin', () => {
  cy.visit('/');
  cy.get('input[name="email"]', { timeout: 15000 }).type(Cypress.env('NUXT_ADMIN_USER_EMAIL'));
  cy.get('input[name="password"]').type(Cypress.env('NUXT_ADMIN_USER_PASSWORD'));
  cy.get('button[type="submit"]').click();
  
  // Wait until we reach the dashboard (meaning login was successful)
  cy.url().should('include', '/admin');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAdmin(): Chainable<void>;
    }
  }
}
