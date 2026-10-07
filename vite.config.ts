import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: resolve(__dirname, 'src/renderer'),
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        pet: resolve(__dirname, 'src/renderer/pet/index.html'),
        settings: resolve(__dirname, 'src/renderer/settings/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@packages': resolve(__dirname, 'src/packages'),
      '@shared': resolve(__dirname, 'src/packages/shared'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer')
    }
  },
  server: {
    port: 5173
  }
});
