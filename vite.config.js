import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    // Performance optimizations
    hmr: {
      overlay: true
    },
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    // Use ES modules for better tree shaking and smaller bundles
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        // Use ES modules for modern browsers - faster parsing
        format: 'es',
        // Code split vendor libraries for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['phosphor-react', 'lucide-react'],
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Aggressive chunk size limits
    chunkSizeWarningLimit: 500,
    // Disable compressed size report for faster builds
    reportCompressedSize: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'phosphor-react',
      'lucide-react'
    ],
    exclude: ['bootstrap'],
    // Faster dependency pre-bundling
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // CSS optimizations
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // Enable esbuild for fastest builds
  esbuild: {
    target: 'esnext',
    minify: true,
    treeShaking: true,
    // Drop console.log in production for smaller bundle
    drop: ['console', 'debugger'],
  },
})
