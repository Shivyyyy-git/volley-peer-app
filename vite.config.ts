import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 8888,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'handle-google-genai-importmap',
        resolveId(id) {
          // Let Vite know @google/genai is external and will be resolved via importmap
          if (id === '@google/genai') {
            return {
              id: '@google/genai',
              external: true
            };
          }
          return null;
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },
    envPrefix: 'VITE_', // Only expose env vars prefixed with VITE_ to the client
    optimizeDeps: {
      exclude: ['@google/genai'],
      force: true // Force re-optimization on server start
    },
    build: {
      rollupOptions: {
        external: ['@google/genai']
      }
    }
  };
});
