import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  plugins: [vue(), svgLoader({ defaultImport: 'url' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '@styles/tokens' as tokens;
          @use '@styles/mixins' as mixins;
        `,
      },
    },
  },
  server: { port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3000', '/resources': 'http://127.0.0.1:3000' } },
});
