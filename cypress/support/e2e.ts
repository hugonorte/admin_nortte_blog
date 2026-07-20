import './commands';

// Ignorar erros benignos de teardown do Nuxt UI (Floating UI / Popper) ou Vue Router
// que ocorrem frequentemente ao navegar entre rotas no Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes("reading 'matched'") || err.message.includes("reading 'left'")) {
    return false;
  }
  return true;
});
