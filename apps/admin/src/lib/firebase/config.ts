export interface AdminFirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  useEmulators: boolean;
}

export const adminFirebaseEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
] as const;

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export function getAdminFirebaseClientConfig(): AdminFirebaseClientConfig | null {
  const config = {
    apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    useEmulators: readEnv("NEXT_PUBLIC_USE_FIREBASE_EMULATORS") === "true"
  };

  const hasRequiredConfig = adminFirebaseEnvKeys.every((key) => readEnv(key).length > 0);

  return hasRequiredConfig ? config : null;
}

export function isAdminFirebaseConfigured(): boolean {
  return getAdminFirebaseClientConfig() !== null;
}
