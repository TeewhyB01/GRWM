export interface FunctionsRuntimeConfig {
  projectId: string;
  storageBucket: string;
  region: string;
  useEmulators: boolean;
}

export const functionsEnvKeys = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FUNCTIONS_REGION"
] as const;

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export function getFunctionsRuntimeConfig(): FunctionsRuntimeConfig {
  return {
    projectId: readEnv("FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("FIREBASE_STORAGE_BUCKET"),
    region: readEnv("FUNCTIONS_REGION") || "us-central1",
    useEmulators: Boolean(readEnv("FIREBASE_AUTH_EMULATOR_HOST") || readEnv("FIRESTORE_EMULATOR_HOST"))
  };
}
