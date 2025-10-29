import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.mamon.app',
  appName: 'Mamon',
  webDir: 'dist',
  server: {
    url: 'https://e521d34a-dc35-4f37-b093-c1137d69552f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;