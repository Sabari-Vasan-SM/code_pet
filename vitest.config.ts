import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@packages': resolve(__dirname, 'src/packages'),
      '@shared': resolve(__dirname, 'src/packages/shared')
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
