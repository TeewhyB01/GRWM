export interface MobileFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  useEmulators: boolean;
  emulators: MobileFirebaseEmulatorConfig;
}

export interface MobileFirebaseEmulatorConfig {
  auth: {
    host: string;
    port: number;
    url: string;
  };
  firestore: {
    host: string;
    port: number;
  };
}

export const mobileFirebaseEnvKeys = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID"
] as const;

export const mobileFirebaseEmulatorEnvKeys = [
  "EXPO_PUBLIC_USE_FIREBASE_EMULATORS",
  "EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST",
  "EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT",
  "EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST",
  "EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT"
] as const;

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

function readBooleanEnv(key: string): boolean {
  return readEnv(key).toLowerCase() === "true";
}

function readPortEnv(key: string, fallback: number): number {
  const value = Number.parseInt(readEnv(key), 10);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function getMobileFirebaseEmulatorConfig(): MobileFirebaseEmulatorConfig {
  const authHost = readEnv("EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST") || "127.0.0.1";
  const authPort = readPortEnv("EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT", 9099);
  const firestoreHost = readEnv("EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST") || "127.0.0.1";
  const firestorePort = readPortEnv("EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT", 8080);

  return {
    auth: {
      host: authHost,
      port: authPort,
      url: `http://${authHost}:${authPort}`
    },
    firestore: {
      host: firestoreHost,
      port: firestorePort
    }
  };
}

export function getMobileFirebaseConfig(): MobileFirebaseConfig | null {
  const config = {
    apiKey: readEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
    useEmulators: readBooleanEnv("EXPO_PUBLIC_USE_FIREBASE_EMULATORS"),
    emulators: getMobileFirebaseEmulatorConfig()
  };

  const hasRequiredConfig = mobileFirebaseEnvKeys.every((key) => readEnv(key).length > 0);

  return hasRequiredConfig ? config : null;
}

export function isMobileFirebaseConfigured(): boolean {
  return getMobileFirebaseConfig() !== null;
}
