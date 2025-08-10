import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reterics.storager',
  appName: 'StorageR',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
