// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    files: ['cypress/**/*.js', 'cypress/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        cy: 'readonly',
        beforeEach: 'readonly',
        before: 'readonly',
        afterEach: 'readonly',
        after: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly'
      }
    }
  }
)
