import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      // Suppress warnings about external modules
      onwarn(warning, warn) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        // Suppress "Importing from external module" warnings for known packages
        if (
          warning.code === 'UNRESOLVED_IMPORT' &&
          warning.message.includes('supabase')
        ) {
          return
        }
        warn(warning)
      },
    },
    commonjsOptions: {
      // Handle CommonJS modules properly
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: [], // Add any packages that should not be pre-bundled
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
})