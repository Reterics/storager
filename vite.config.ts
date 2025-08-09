import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'
import defineCustomConfig from './define.config';
import storageRPostBuild from "./post.build";
import { version } from './package.json';


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  const outDir = env.VITE_BASENAME ? './dist' + env.VITE_BASENAME : './dist';
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
      storageRPostBuild({outDir: outDir})
    ],
    define: defineCustomConfig.defineViteConfig,
    publicDir: "public",
    assetsInclude: './src/assets/*.*',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './tests/setup.js',
      exclude: ['tests/e2e/**/*.spec.ts', 'node_modules', 'dist', 'integrations', 'standalone-cli', '**/*.test.skip.js'],
      coverage: {
        enabled: true,
        provider: 'custom',
        customProviderModule: 'vitest-monocart-coverage'
      }
    },
  }
})
