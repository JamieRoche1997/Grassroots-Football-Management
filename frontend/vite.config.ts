import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    include: ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
  },
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc', // Ensure Emotion is used
    },
  },
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', 
  },
});
