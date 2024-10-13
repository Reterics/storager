import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import defineCustomConfig from './define.config';

export default defineConfig({
  base: './',
  plugins: [react()],
  define: defineCustomConfig.defineViteConfig,
  publicDir: "public",
  assetsInclude: './src/assets/*.*',
})
