import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";

try {
  const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#\s=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  console.log('.env file not found or could not be read');
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    watchForFileChanges: false,
    excludeSpecPattern: ['**/node_modules/**', '**/.nuxt/**', '**/.data/**', '**/.git/**', '**/.agents/**'],
    setupNodeEvents(on, config) {
      config.env.NUXT_ADMIN_USER_EMAIL = process.env.NUXT_ADMIN_USER_EMAIL;
      config.env.NUXT_ADMIN_USER_PASSWORD = process.env.NUXT_ADMIN_USER_PASSWORD;
      config.env.NUXT_PUBLIC_API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL;
      return config;
    },
    viewportWidth: 375,
    viewportHeight: 667,
  },
});

