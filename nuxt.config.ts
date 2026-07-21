// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon','@nuxt/ui'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://admin.abertamente.net/api' 
        : process.env.NUXT_PUBLIC_API_BASE_URL,
      siteName: process.env.NODE_ENV === 'production' 
        ? 'AbertaMente Painel' 
        : process.env.NUXT_PUBLIC_SITE_NAME,
      publicImagesFolder: process.env.NODE_ENV === 'production' 
        ? 'https://admin.abertamente.net/public' 
        : process.env.NUXT_PUBLIC_IMAGES_FOLDER,
    }
  },
  // Fix for "Adding different instances of a keyed plugin" error
  // See: https://ui.nuxt.com/components/editor
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