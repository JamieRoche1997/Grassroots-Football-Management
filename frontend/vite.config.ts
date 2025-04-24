import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    include: ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
  },
  resolve: {
    alias: {
      // Removed alias that was causing conflicts
    },
  },
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', 
  },
});
