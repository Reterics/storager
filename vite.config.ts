import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import defineCustomConfig from './define.config';
import storageRPostBuild from "./post.build";
import { version } from './package.json';


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  const outDir = env.VITE_BASENAME ? './dist' + env.VITE_BASENAME : './dist';
  return {
    base: './',
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
    plugins: [react(), storageRPostBuild({outDir: outDir})],
    define: defineCustomConfig.defineViteConfig,
    publicDir: "public",
    assetsInclude: './src/assets/*.*',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './tests/setup.js',
      exclude: ['tests/e2e/**/*.spec.ts'],
      coverage: {
        enabled: true,
        provider: 'custom',
        customProviderModule: 'vitest-monocart-coverage'
      }
    },
  }
})
