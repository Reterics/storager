import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import defineCustomConfig from './define.config';
import storageRPostBuild from './post.build';
import { version } from './package.json';

export default defineConfig(({ mode }) => {
  const outDir = './dist';
  const isDev = mode === 'development';
  return {
    base: './',
    server: {
      host: '0.0.0.0',
      // Enable HTTPS in dev to satisfy window.isSecureContext for APIs like camera/clipboard
      //https: isDev ? true : undefined,
    },
    build: {
      outDir: outDir,
      emptyOutDir: true,
      sourcemap: mode === 'test',
      minify: mode === 'test' || mode === 'development' ? false : 'esbuild',
      rollupOptions: {
        output: {
          assetFileNames: `assets/[name]-[hash]-v${version}[extname]`,
          chunkFileNames: `chunks/[name]-[hash]-v${version}.js`,
          entryFileNames: `[name]-[hash]-v${version}.js`,
        },
      },
    },
    plugins: [
      react(),
      // Generates a self-signed cert for local dev so HTTPS works without manual cert files
      ...(isDev ? [basicSsl()] : []),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: {
          enabled: true,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
          globIgnores: ['**/uploads/**'],
          navigateFallback: 'index.html',
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB to include main bundle
        },
        manifest: {
          name: 'StorageR',
          short_name: 'StorageR',
          description: 'Manage your store in an easy way',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          theme_color: '#111827',
          background_color: '#000000',
          icons: [
            {
              src: '/img/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/img/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/img/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/img/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
      storageRPostBuild({ outDir: outDir }),
    ],
    define: defineCustomConfig.defineViteConfig,
    publicDir: 'public',
    assetsInclude: './src/assets/*.*',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './tests/setup.js',
      exclude: [
        'tests/e2e/**/*.spec.ts',
        'node_modules',
        'dist',
        'integrations',
        'standalone-cli',
        '**/*.test.skip.js',
      ],
      coverage: {
        enabled: true,
        provider: 'custom',
        customProviderModule: 'vitest-monocart-coverage',
      },
    },
  };
});
