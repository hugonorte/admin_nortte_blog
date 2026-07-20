describe('Fluxo de Esqueci Minha Senha', () => {
  it('deve navegar para a página de esqueci a senha a partir do login', () => {
    cy.visit('/')
    cy.contains('Esqueci minha senha').click()
    cy.url().should('include', '/esqueci-senha')
  })

  it('deve validar o preenchimento do email e exibir mensagem de sucesso', () => {
    cy.visit('/esqueci-senha')
    cy.get('button[type="submit"]').click()
    cy.contains('E-mail inválido').should('be.visible') // Validação Zod
    
    // Interceptar a API mockada para sucesso
    cy.intercept('POST', '**/api/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Se o e-mail existir em nossa base de dados, um link de recuperação foi enviado.' }
    }).as('forgotPasswordReq')

    cy.get('input[name="email"]').type('teste@abertamente.net')
    cy.get('button[type="submit"]').click()
    
    cy.wait('@forgotPasswordReq')
    cy.contains('Se o e-mail existir').should('be.visible')
  })
})

describe('Fluxo de Redefinição de Senha', () => {
  it('deve validar as senhas e redefinir com sucesso', () => {
    cy.visit('/redefinir-senha?token=fake-token&email=teste@abertamente.net')
    
    cy.get('button[type="submit"]').click()
    cy.contains('A senha é obrigatória').should('be.visible')

    cy.get('input[name="password"]').type('1234')
    cy.contains('A senha deve ter pelo menos 8 caracteres').should('be.visible') // Zod

    cy.get('input[name="password"]').clear().type('novasenha123')
    cy.get('input[name="password_confirmation"]').type('senhaerrada')
    cy.get('button[type="submit"]').click()
    cy.contains('As senhas não coincidem').should('be.visible') // Zod

    cy.intercept('POST', '**/api/auth/reset-password', {
      statusCode: 200,
      body: { message: 'Senha redefinida com sucesso' }
    }).as('resetPasswordReq')

    cy.get('input[name="password_confirmation"]').clear().type('novasenha123')
    cy.get('button[type="submit"]').click()
    
    cy.wait('@resetPasswordReq')
    cy.url().should('eq', Cypress.config().baseUrl + '/') // Redireciona para o login
  })
})
