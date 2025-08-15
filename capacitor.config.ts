import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e521d34adc354f37b093c1137d69552f',
  appName: 'word-of-mouth-app',
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