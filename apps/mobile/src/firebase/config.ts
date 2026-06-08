export interface MobileFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  useEmulators: boolean;
}

export const mobileFirebaseEnvKeys = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID"
] as const;

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export function getMobileFirebaseConfig(): MobileFirebaseConfig | null {
  const config = {
    apiKey: readEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
    useEmulators: readEnv("EXPO_PUBLIC_USE_FIREBASE_EMULATORS") === "true"
  };

  const hasRequiredConfig = mobileFirebaseEnvKeys.every((key) => readEnv(key).length > 0);

  return hasRequiredConfig ? config : null;
}

export function isMobileFirebaseConfigured(): boolean {
  return getMobileFirebaseConfig() !== null;
}
