import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // ✅ REQUIRED FOR DOCKER + NGINX
  base: '/',      

  // ✅ Ensure output goes to dist/
  build: {
    outDir: 'dist',
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
