import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Backend is the ASP.NET project in ../backend (http profile in launchSettings.json)
      '/api': {
        target: 'http://localhost:5099',
        changeOrigin: true,
      },
    },
  },
});
