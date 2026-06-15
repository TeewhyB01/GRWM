import { firestoreCollections, type PrivacyConsent } from "@grwm/shared";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore";

import { mapFirebaseAuthUser, type MobileAuthUser } from "../auth/authService.ts";
import { getMobileAuth, getMobileFirestore } from "../firebase/client.ts";
import {
  getMobileFirebaseConfig,
  type MobileFirebaseConfig
} from "../firebase/config.ts";
import {
  createUserFoundationDocuments,
  type SignupProfileInput,
  type UserFoundationDocuments
} from "../profile/profileService.ts";
import {
  createPrivacyConsentChoices,
  recordPrivacyConsent,
  type PrivacyConsentChoices
} from "../privacy/privacyService.ts";

type EnvMap = Record<string, string | undefined>;

export type QaAccessDisabledReason =
  | "missing_explicit_flag"
  | "production_runtime"
  | "missing_firebase_config"
  | "firebase_emulators_disabled"
  | "production_firebase_config";

export interface QaAccessState {
  enabled: boolean;
  reason: QaAccessDisabledReason | "enabled";
}

export interface LocalQaCredentials {
  email: string;
  password: string;
}

interface QaAccessEvaluationInput {
  env?: EnvMap;
  firebaseConfig?: MobileFirebaseConfig | null;
}

interface LocalQaCredentialInput {
  attempt?: number;
  env?: EnvMap;
  now?: Date;
  randomToken?: string;
}

export interface LocalQaAccessOptions extends QaAccessEvaluationInput {
  createPrivacyConsent?: boolean;
  maxCreateAttempts?: number;
  now?: Date;
  privacyConsentChoices?: Partial<PrivacyConsentChoices>;
  profile?: SignupProfileInput;
  randomToken?: string;
}

export interface LocalQaAccessResult {
  credentials: LocalQaCredentials;
  foundationDocuments: UserFoundationDocuments;
  privacyConsent: PrivacyConsent | null;
  user: MobileAuthUser;
}

interface EnsureUserDocumentsInput {
  authUser: MobileAuthUser;
  nowIso: string;
  profile?: SignupProfileInput;
}

interface RecordPrivacyConsentInput {
  choices: Partial<PrivacyConsentChoices>;
  userId: string;
}

export interface LocalQaAccessDependencies {
  createAuthUser(credentials: LocalQaCredentials): Promise<MobileAuthUser>;
  ensureUserDocuments(input: EnsureUserDocumentsInput): Promise<UserFoundationDocuments>;
  recordPrivacyConsent(input: RecordPrivacyConsentInput): Promise<PrivacyConsent>;
}

const qaAccessFlagKeys = [
  "GRWM_ENABLE_QA_ACCESS",
  "EXPO_PUBLIC_GRWM_ENABLE_QA_ACCESS"
] as const;
const qaEmailPrefixKeys = [
  "GRWM_QA_EMAIL_PREFIX",
  "EXPO_PUBLIC_GRWM_QA_EMAIL_PREFIX"
] as const;
const safeLocalFirebaseProjectIds = new Set(["demo-grwm"]);
const defaultQaEmailPrefix = "wardrobe-qa";

function readEnv(env: EnvMap, key: string): string {
  return env[key] ?? "";
}

function readFirstEnv(env: EnvMap, keys: readonly string[]): string {
  return keys.map((key) => readEnv(env, key)).find((value) => value.length > 0) ?? "";
}

function readBooleanEnv(env: EnvMap, keys: readonly string[]): boolean {
  return readFirstEnv(env, keys).toLowerCase() === "true";
}

function getRuntimeMode(env: EnvMap): string {
  return (
    readEnv(env, "EXPO_PUBLIC_GRWM_APP_ENV") ||
    readEnv(env, "GRWM_APP_ENV") ||
    readEnv(env, "NODE_ENV") ||
    "development"
  ).toLowerCase();
}

function isReactNativeProductionRuntime(): boolean {
  const runtimeGlobal = globalThis as typeof globalThis & { __DEV__?: boolean };

  return runtimeGlobal.__DEV__ === false;
}

function isDevelopmentOrLocalRuntime(env: EnvMap): boolean {
  if (isReactNativeProductionRuntime()) {
    return false;
  }

  return ["development", "local", "test"].includes(getRuntimeMode(env));
}

function isSafeLocalFirebaseConfig(config: MobileFirebaseConfig): boolean {
  return (
    safeLocalFirebaseProjectIds.has(config.projectId) &&
    config.authDomain === `${config.projectId}.firebaseapp.com` &&
    config.storageBucket === `${config.projectId}.appspot.com`
  );
}

function createRandomToken(randomToken?: string): string {
  if (randomToken) {
    return randomToken.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "localqa";
  }

  return Math.random().toString(36).slice(2, 12) || "localqa";
}

function createTimestampToken(now: Date): string {
  return now.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
}

export function getLocalQaEmailPrefix(env: EnvMap = process.env): string {
  const configuredPrefix = readFirstEnv(env, qaEmailPrefixKeys)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

  return configuredPrefix || defaultQaEmailPrefix;
}

export function createLocalQaEmail(input: LocalQaCredentialInput = {}): string {
  const now = input.now ?? new Date();
  const attemptSuffix = input.attempt && input.attempt > 0 ? `-${input.attempt}` : "";
  const localPart = [
    getLocalQaEmailPrefix(input.env ?? process.env),
    createTimestampToken(now),
    `${createRandomToken(input.randomToken)}${attemptSuffix}`
  ].join("+");

  return `${localPart}@example.test`;
}

export function createLocalQaPassword(input: LocalQaCredentialInput = {}): string {
  const now = input.now ?? new Date();

  return [
    "local",
    "qa",
    createTimestampToken(now),
    createRandomToken(input.randomToken)
  ].join("-");
}

export function createLocalQaCredentials(input: LocalQaCredentialInput = {}): LocalQaCredentials {
  return {
    email: createLocalQaEmail(input),
    password: createLocalQaPassword(input)
  };
}

export function getQaAccessState(input: QaAccessEvaluationInput = {}): QaAccessState {
  const env = input.env ?? process.env;

  if (!readBooleanEnv(env, qaAccessFlagKeys)) {
    return {
      enabled: false,
      reason: "missing_explicit_flag"
    };
  }

  if (!isDevelopmentOrLocalRuntime(env)) {
    return {
      enabled: false,
      reason: "production_runtime"
    };
  }

  const firebaseConfig = input.firebaseConfig === undefined
    ? getMobileFirebaseConfig()
    : input.firebaseConfig;

  if (!firebaseConfig) {
    return {
      enabled: false,
      reason: "missing_firebase_config"
    };
  }

  if (!firebaseConfig.useEmulators) {
    return {
      enabled: false,
      reason: "firebase_emulators_disabled"
    };
  }

  if (!isSafeLocalFirebaseConfig(firebaseConfig)) {
    return {
      enabled: false,
      reason: "production_firebase_config"
    };
  }

  return {
    enabled: true,
    reason: "enabled"
  };
}

export function isQaAccessEnabled(input: QaAccessEvaluationInput = {}): boolean {
  return getQaAccessState(input).enabled;
}

function isFirebaseEmailAlreadyInUse(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "auth/email-already-in-use";
}

async function createFirebaseLocalQaUser(credentials: LocalQaCredentials): Promise<MobileAuthUser> {
  const credential = await createUserWithEmailAndPassword(
    await getMobileAuth(),
    credentials.email,
    credentials.password
  );

  return mapFirebaseAuthUser(credential.user);
}

export async function ensureLocalQaUserDocuments({
  authUser,
  nowIso,
  profile
}: EnsureUserDocumentsInput): Promise<UserFoundationDocuments> {
  const db = getMobileFirestore();
  const userRef = doc(db, firestoreCollections.users, authUser.id);
  const userProfileRef = doc(db, firestoreCollections.userProfiles, authUser.id);
  const [userSnapshot, userProfileSnapshot] = await Promise.all([
    getDoc(userRef),
    getDoc(userProfileRef)
  ]);
  const foundationInput: {
    authUser: MobileAuthUser;
    input?: SignupProfileInput;
    nowIso: string;
  } = {
    authUser,
    nowIso
  };

  if (profile !== undefined) {
    foundationInput.input = profile;
  }

  const foundationDocuments = createUserFoundationDocuments(foundationInput);

  if (!userSnapshot.exists() || !userProfileSnapshot.exists()) {
    const batch = writeBatch(db);

    if (!userSnapshot.exists()) {
      batch.set(userRef, foundationDocuments.user);
    }

    if (!userProfileSnapshot.exists()) {
      batch.set(userProfileRef, foundationDocuments.userProfile);
    }

    await batch.commit();
  }

  return foundationDocuments;
}

const firebaseQaAccessDependencies: LocalQaAccessDependencies = {
  createAuthUser: createFirebaseLocalQaUser,
  ensureUserDocuments: ensureLocalQaUserDocuments,
  recordPrivacyConsent: ({ choices, userId }) => recordPrivacyConsent({ choices, userId })
};

export async function continueWithLocalQaAccount(
  options: LocalQaAccessOptions = {},
  dependencies: LocalQaAccessDependencies = firebaseQaAccessDependencies
): Promise<LocalQaAccessResult> {
  const qaAccessInput: QaAccessEvaluationInput = {};

  if (options.env !== undefined) {
    qaAccessInput.env = options.env;
  }

  if (options.firebaseConfig !== undefined) {
    qaAccessInput.firebaseConfig = options.firebaseConfig;
  }

  const qaAccessState = getQaAccessState(qaAccessInput);

  if (!qaAccessState.enabled) {
    throw new Error(`Local QA access is disabled: ${qaAccessState.reason}.`);
  }

  const now = options.now ?? new Date();
  const nowIso = now.toISOString();
  const maxCreateAttempts = options.maxCreateAttempts ?? 3;

  for (let attempt = 0; attempt < maxCreateAttempts; attempt += 1) {
    const credentialInput: LocalQaCredentialInput = {
      attempt,
      now
    };

    if (options.env !== undefined) {
      credentialInput.env = options.env;
    }

    if (options.randomToken !== undefined) {
      credentialInput.randomToken = options.randomToken;
    }

    const credentials = createLocalQaCredentials(credentialInput);

    try {
      const user = await dependencies.createAuthUser(credentials);
      const ensureDocumentsInput: EnsureUserDocumentsInput = {
        authUser: user,
        nowIso
      };

      if (options.profile !== undefined) {
        ensureDocumentsInput.profile = options.profile;
      }

      const foundationDocuments = await dependencies.ensureUserDocuments(ensureDocumentsInput);
      const privacyConsent = options.createPrivacyConsent === true
        ? await dependencies.recordPrivacyConsent({
            choices: options.privacyConsentChoices ?? createPrivacyConsentChoices(),
            userId: user.id
          })
        : null;

      return {
        credentials,
        foundationDocuments,
        privacyConsent,
        user
      };
    } catch (error) {
      if (isFirebaseEmailAlreadyInUse(error) && attempt < maxCreateAttempts - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to create a local QA account.");
}
