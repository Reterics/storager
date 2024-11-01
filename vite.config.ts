import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import defineCustomConfig from './define.config';
import storageRPostBuild from "./post.build";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  const outDir = env.VITE_BASENAME ? './dist' + env.VITE_BASENAME : './dist';
  return {
    base: './',
    build: {
      outDir: outDir,
      emptyOutDir: true,
      sourcemap: mode === 'test',
      minify: mode === 'test' || mode === 'development' ? false : 'esbuild'
    },
    plugins: [react(), storageRPostBuild({outDir: outDir})],
    define: defineCustomConfig.defineViteConfig,
    publicDir: "public",
    assetsInclude: './src/assets/*.*',
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './tests/setup.js',
      coverage: {
        enabled: true,
        provider: 'custom',
        customProviderModule: 'vitest-monocart-coverage'
      }
    },
  }
})
