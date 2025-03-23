import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.codrive.io',
  appName: 'CoDrive',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "alert", "sound"]
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "phone"],
    },
    GoogleAuth: {
      scopes: [
        "profile",
        "email"
      ],
      serverClientId: '549615140881-dui05fak3oecrot6sdoeud0pp37umm31.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
