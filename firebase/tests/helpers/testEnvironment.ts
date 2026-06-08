import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
  type TestEnvironmentConfig
} from "@firebase/rules-unit-testing";
import type firebase from "firebase/compat/app";
import "firebase/compat/storage";

import { testUserIds } from "./ids.ts";

export type RulesTestTarget = "firestore" | "storage";

export const firebaseEmulatorPorts = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
  ui: 4000
} as const;

const helperDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(helperDirectory, "../../..");

function readRulesFile(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), "utf8");
}

function emulatorHostAndPort(envKey: string, fallbackPort: number): {
  host: string;
  port: number;
} {
  const raw = process.env[envKey];

  if (!raw) {
    return {
      host: "127.0.0.1",
      port: fallbackPort
    };
  }

  const parsed = new URL(`http://${raw}`);

  return {
    host: parsed.hostname,
    port: Number(parsed.port)
  };
}

export function firebaseRulesTestProjectId(): string {
  return process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? "demo-grwm";
}

export async function initializeRulesTestEnvironment(
  targets: readonly RulesTestTarget[]
): Promise<RulesTestEnvironment> {
  const config: TestEnvironmentConfig = {
    projectId: firebaseRulesTestProjectId()
  };

  if (targets.includes("firestore")) {
    config.firestore = {
      ...emulatorHostAndPort("FIRESTORE_EMULATOR_HOST", firebaseEmulatorPorts.firestore),
      rules: readRulesFile("firebase/firestore.rules")
    };
  }

  if (targets.includes("storage")) {
    config.storage = {
      ...emulatorHostAndPort("FIREBASE_STORAGE_EMULATOR_HOST", firebaseEmulatorPorts.storage),
      rules: readRulesFile("firebase/storage.rules")
    };
  }

  return initializeTestEnvironment(config);
}

export function authenticatedTestContext(
  testEnv: RulesTestEnvironment,
  userId: string
): RulesTestContext {
  return testEnv.authenticatedContext(userId, {
    email: `${userId}@example.test`,
    email_verified: true
  });
}

export function unauthenticatedTestContext(testEnv: RulesTestEnvironment): RulesTestContext {
  return testEnv.unauthenticatedContext();
}

export function ownerAdminTestContext(testEnv: RulesTestEnvironment): RulesTestContext {
  return authenticatedTestContext(testEnv, testUserIds.ownerAdmin);
}

export function moderatorAdminTestContext(testEnv: RulesTestEnvironment): RulesTestContext {
  return authenticatedTestContext(testEnv, testUserIds.moderatorAdmin);
}

export async function seedFirestoreDocuments(
  testEnv: RulesTestEnvironment,
  documents: readonly {
    path: string;
    data: Record<string, unknown>;
  }[]
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    for (const document of documents) {
      await db.doc(document.path).set(document.data);
    }
  });
}

export const testImageBytes = new Uint8Array([71, 82, 87, 77]);
export const testImageMetadata = {
  contentType: "image/jpeg",
  customMetadata: {
    fixture: "grwm-rules-test"
  }
};

export async function seedStorageObject(
  testEnv: RulesTestEnvironment,
  path: string
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.storage().ref(path).put(testImageBytes, testImageMetadata);
  });
}

async function deleteStoragePrefix(reference: firebase.storage.Reference): Promise<void> {
  const result = await reference.listAll();

  await Promise.all([
    ...result.items.map((item) => item.delete()),
    ...result.prefixes.map((prefix) => deleteStoragePrefix(prefix))
  ]);
}

export async function clearFirestoreEmulator(testEnv: RulesTestEnvironment): Promise<void> {
  await testEnv.clearFirestore();
}

export async function clearStorageEmulator(testEnv: RulesTestEnvironment): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await deleteStoragePrefix(context.storage().ref());
  });
}

export async function cleanupRulesTestEnvironment(testEnv: RulesTestEnvironment): Promise<void> {
  await testEnv.cleanup();
}
