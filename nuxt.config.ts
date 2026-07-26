// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon','@nuxt/ui'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8080/api',
      siteName: 'Nortte Blog',
      publicImagesFolder: 'http://localhost:8080/public',
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        'prosemirror-state',
        'prosemirror-transform',
        'prosemirror-model',
        'prosemirror-view',
        'prosemirror-dropcursor',
        'prosemirror-gapcursor',
        'prosemirror-history',
        'prosemirror-keymap',
        'prosemirror-commands',
        'prosemirror-schema-list',
        'prosemirror-inputrules',
        '@tiptap/pm/state',
        '@tiptap/pm/model',
        '@tiptap/pm/view',
        '@tiptap/pm/transform',
        '@tiptap/pm/history',
        '@tiptap/pm/dropcursor',
        '@tiptap/pm/gapcursor',
        '@tiptap/pm/keymap',
        '@tiptap/pm/commands',
        '@tiptap/pm/schema-list',
        '@tiptap/core',
        '@tiptap/vue-3'
      ]
    }
  }
})