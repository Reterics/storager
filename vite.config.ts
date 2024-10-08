import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

const vendorModules = ['leaflet', 'signature_pad', 'react-icons'];

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const module =  vendorModules.find(m => id.includes(m));
          if (module) {
            return module;
          }

          if (id.includes('firebase/app')) {
            return 'firebase_app';
          }
          if (id.includes('firebase/auth')) {
            return 'firebase_auth';
          }
          if (id.includes('firebase/storage') || id.includes('firebase/firestore')) {
            return 'firebase_storage';
          }
          if (id.includes('@firebase') || id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
