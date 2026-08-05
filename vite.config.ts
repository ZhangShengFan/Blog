import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appBase = process.env.VITE_BASE_PATH?.trim() || '/';

export default defineConfig({
  plugins: [react()],
  base: appBase,
  css: {
    postcss: path.resolve(__dirname, './config/postcss.config.js'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './config'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    reportCompressedSize: false,
    cssMinify: true,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) {
              return 'react-core';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('react-helmet') || id.includes('hoist-non-react-statics')) {
              return 'react-helmet';
            }
          }
        },
        onlyExplicitManualChunks: true,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
  },
  publicDir: 'public',
});

