import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [
        react(), 
        tailwindcss(),
        {
          name: 'strip-formdata-polyfill-fetch',
          transform(code, id) {
            if (code.includes('.fetch =') || code.includes('.fetch=') || code.includes('fetch =') || code.includes('fetch=')) {
              return code
                .replace(/global\.fetch\s*=/g, '// global.fetch =')
                .replace(/globalThis\.fetch\s*=/g, '// globalThis.fetch =')
                .replace(/self\.fetch\s*=/g, '// self.fetch =')
                .replace(/window\.fetch\s*=/g, '// window.fetch =');
            }
          }
        }
      ],
      optimizeDeps: {
        exclude: ['node-fetch', 'formdata-polyfill', '@google/genai', '@supabase/supabase-js', 'google-auth-library']
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'global': 'window',
      },
      resolve: {
        alias: [
          { find: /^node-fetch(\/.*)?$/, replacement: path.resolve(__dirname, 'src/fetch-polyfill.ts') },
          { find: /^formdata-polyfill(\/.*)?$/, replacement: path.resolve(__dirname, 'src/formdata-mock.ts') },
          { find: '@', replacement: path.resolve(__dirname, '.') },
          { find: '@supabase/node-fetch', replacement: path.resolve(__dirname, 'src/fetch-polyfill.ts') },
        ]
      }
    };
});
