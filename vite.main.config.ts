import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

const externals = [
  'electron',
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
];

export default defineConfig({
  resolve: {
    alias: {
      '@packages': resolve(import.meta.dirname, 'src/packages'),
      '@shared': resolve(import.meta.dirname, 'src/packages/shared'),
      '@main': resolve(import.meta.dirname, 'src/main')
    }
  },
  build: {
    target: 'node22',
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: {
        'main/index': resolve(import.meta.dirname, 'src/main/index.ts'),
        'preload/pet-preload': resolve(import.meta.dirname, 'src/preload/pet-preload.ts'),
        'preload/settings-preload': resolve(import.meta.dirname, 'src/preload/settings-preload.ts'),
        'cli/codepet-cli': resolve(import.meta.dirname, 'src/cli/codepet-cli.ts')
      },
      formats: ['cjs']
    },
    rollupOptions: {
      external: externals,
      output: {
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name]-[hash].cjs'
      }
    }
  }
});
