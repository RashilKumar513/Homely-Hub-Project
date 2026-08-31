import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          iconsVendor: ['lucide-react'],
          mapsVendor: ['leaflet', 'react-leaflet'],
          utilsVendor: ['axios', 'moment', 'gsap'],
        },
      },
    },
  },
});
