import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Não falhar o build se houver erros de TypeScript
    emptyOutDir: true,
    // Para o Netlify
    sourcemap: true
  },
  // Aumentar timeout para builds
  server: {
    hmr: {
      timeout: 60000
    }
  }
});