import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(
    import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Add this to handle some React-related warnings
            jsxRuntime: 'automatic',
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        // Required for some dependencies that expect Node.js globals
        global: 'globalThis',
    },
    build: {
        rollupOptions: {
            // Add custom warning handler to suppress external module warnings
            onwarn(warning, warn) {
                // Suppress warnings about external modules
                if (warning.code === 'UNRESOLVED_IMPORT') {
                    return
                }
                // Suppress module level directive warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                // Suppress "use client" directive warnings from React Server Components
                if (warning.message && warning.message.includes('"use client"')) {
                    return
                }
                // Log all other warnings
                warn(warning)
            },
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': [
                        '@radix-ui/react-accordion',
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-label',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-toast',
                        '@radix-ui/react-tooltip',
                    ],
                },
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/node_modules/],
        },
        // Increase chunk size warning limit if needed
        chunkSizeWarningLimit: 1000,
        sourcemap: false, // Disable sourcemaps for faster builds
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@supabase/supabase-js',
            'date-fns',
            'zod',
        ],
        exclude: [],
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis',
            },
        },
    },
    server: {
        port: 5173,
        strictPort: false,
        host: true,
    },
})