import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

import {
  canAccessMobileRoute,
  canUseConsentGatedFeature,
  consentGatedFeatureRequirements,
  createAsyncStorageAuthPersistence,
  createCheckingAuthState,
  createPrivacyConsentDocument,
  createPrivacyConsentChoices,
  createPlaceholderSignedInAuthState,
  createSignedOutAuthState,
  createStylePreferencePlaceholder,
  createUserDeletionRequestDocument,
  createUserFoundationDocuments,
  getMobileFirebaseConfig,
  getMobileFirebaseEmulatorConfig,
  getNextRouteForAuthAndConsent,
  isMobileFirebaseConfigured,
  mergePrivacyConsentChoices,
  mobileFirebaseEmulatorEnvKeys,
  mapFirebaseAuthUser,
  mobileFirebaseEnvKeys,
  mobileFoundation,
  mobileRoutes,
  optionalPrivacyConsentPurposes,
  socialLoginTodos,
  supportedLocales,
  themes,
  validatePrivacyConsentDocument,
  validateStylePreferencePlaceholder,
  validateUserDeletionRequestDocument,
  validateUserFoundationDocuments
} from "./index.ts";

interface MobileAppJson {
  expo?: {
    android?: {
      package?: string;
    };
    ios?: {
      bundleIdentifier?: string;
      infoPlist?: {
        ITSAppUsesNonExemptEncryption?: boolean;
      };
    };
    plugins?: string[];
    extra?: {
      usesDevelopmentBuilds?: boolean;
      expoGoSupported?: boolean;
      eas?: {
        projectId?: string;
      };
    };
  };
}

interface MobileEasJson {
  cli?: {
    version?: string;
  };
  build?: {
    development?: {
      developmentClient?: boolean;
      distribution?: string;
      android?: {
        buildType?: string;
      };
    };
    "development-simulator"?: {
      developmentClient?: boolean;
      distribution?: string;
      ios?: {
        simulator?: boolean;
      };
    };
    production?: Record<string, unknown>;
  };
}

function readMobileConfigFile<T>(fileName: string): T {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`../${fileName}`, import.meta.url)), "utf8")) as T;
}

test("@grwm/mobile requires a development build instead of Expo Go", () => {
  assert.equal(mobileFoundation.expoGoSupported, false);
  assert.equal(mobileFoundation.developmentBuildRequired, true);
});

test("@grwm/mobile has EAS development build config without store publishing defaults", () => {
  const appConfig = readMobileConfigFile<MobileAppJson>("app.json");
  const easConfig = readMobileConfigFile<MobileEasJson>("eas.json");

  assert.equal(appConfig.expo?.plugins?.includes("expo-dev-client"), true);
  assert.equal(appConfig.expo?.ios?.bundleIdentifier, "com.grwm.mobile");
  assert.equal(appConfig.expo?.ios?.infoPlist?.ITSAppUsesNonExemptEncryption, false);
  assert.equal(appConfig.expo?.android?.package, "com.grwm.mobile");
  assert.equal(appConfig.expo?.extra?.usesDevelopmentBuilds, true);
  assert.equal(appConfig.expo?.extra?.expoGoSupported, false);
  assert.equal(appConfig.expo?.extra?.eas?.projectId, "07f8ab87-4d20-4a95-9fea-caaf899bc741");
  assert.equal(easConfig.cli?.version, ">= 20.0.0");
  assert.equal(easConfig.build?.development?.developmentClient, true);
  assert.equal(easConfig.build?.development?.distribution, "internal");
  assert.equal(easConfig.build?.development?.android?.buildType, "apk");
  assert.equal(easConfig.build?.["development-simulator"]?.developmentClient, true);
  assert.equal(easConfig.build?.["development-simulator"]?.ios?.simulator, true);
  assert.deepEqual(easConfig.build?.production, {});
});

test("@grwm/mobile starts as a TypeScript React Native placeholder", () => {
  assert.equal(mobileFoundation.framework, "expo-react-native");
  assert.equal(mobileFoundation.platform, "react-native");
  assert.equal(mobileFoundation.language, "typescript");
});

test("@grwm/mobile defines the Phase 1 route shell", () => {
  assert.deepEqual(
    mobileRoutes.map((route) => route.id),
    [
      "welcome",
      "login",
      "signUp",
      "language",
      "country",
      "privacy",
      "onboarding",
      "wardrobe",
      "today",
      "settings"
    ]
  );
});

test("@grwm/mobile starts English-first with light and dark themes", () => {
  assert.deepEqual(supportedLocales, ["en"]);
  assert.equal(themes.light.mode, "light");
  assert.equal(themes.dark.mode, "dark");
});

test("@grwm/mobile defines Firebase Auth helpers without hardcoded config", () => {
  assert.equal(isMobileFirebaseConfigured(), false);
  assert.ok(mobileFirebaseEnvKeys.includes("EXPO_PUBLIC_FIREBASE_API_KEY"));
  assert.ok(mobileFirebaseEmulatorEnvKeys.includes("EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST"));
  assert.deepEqual(mapFirebaseAuthUser({ uid: "user_1", email: "ari@example.com", emailVerified: true }), {
    id: "user_1",
    email: "ari@example.com",
    emailVerified: true
  });
  assert.equal(socialLoginTodos.length, 2);
});

test("@grwm/mobile accepts safe local emulator Firebase placeholders", () => {
  const envKeys = [...mobileFirebaseEnvKeys, ...mobileFirebaseEmulatorEnvKeys];
  const previousEnv = new Map(envKeys.map((key) => [key, process.env[key]]));

  try {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = "demo-api-key";
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = "demo-grwm.firebaseapp.com";
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = "demo-grwm";
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = "demo-grwm.appspot.com";
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "000000000000";
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID = "demo-grwm-mobile";
    process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS = "true";
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST = "10.0.2.2";
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT = "9099";
    process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST = "10.0.2.2";
    process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT = "8080";

    const emulatorConfig = getMobileFirebaseEmulatorConfig();
    const firebaseConfig = getMobileFirebaseConfig();

    assert.equal(firebaseConfig?.projectId, "demo-grwm");
    assert.equal(firebaseConfig?.useEmulators, true);
    assert.equal(emulatorConfig.auth.url, "http://10.0.2.2:9099");
    assert.equal(emulatorConfig.firestore.host, "10.0.2.2");
    assert.equal(emulatorConfig.firestore.port, 8080);
  } finally {
    for (const [key, value] of previousEnv) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test("@grwm/mobile guards protected routes until auth exists", () => {
  assert.equal(canAccessMobileRoute("wardrobe", createCheckingAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createPlaceholderSignedInAuthState()), true);
  assert.equal(canAccessMobileRoute("privacy", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("login", createSignedOutAuthState()), true);
});

test("@grwm/mobile routes signed-in users through privacy consent before protected screens", () => {
  const signedIn = createPlaceholderSignedInAuthState();

  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "wardrobe",
      authState: createSignedOutAuthState(),
      privacyConsentStatus: "missing"
    }),
    "login"
  );
  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "login",
      authState: signedIn,
      privacyConsentStatus: "missing"
    }),
    "privacy"
  );
  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "wardrobe",
      authState: signedIn,
      privacyConsentStatus: "missing"
    }),
    "privacy"
  );
  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "privacy",
      authState: signedIn,
      privacyConsentStatus: "missing"
    }),
    null
  );
  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "welcome",
      authState: signedIn,
      privacyConsentStatus: "recorded"
    }),
    "wardrobe"
  );
  assert.equal(
    getNextRouteForAuthAndConsent({
      routeId: "settings",
      authState: signedIn,
      privacyConsentStatus: "recorded"
    }),
    null
  );
});

test("@grwm/mobile builds profile defaults after email signup", () => {
  const documents = createUserFoundationDocuments({
    authUser: {
      id: "user_1",
      email: "ari@example.com",
      emailVerified: false
    },
    input: {
      displayName: " Ari ",
      locale: "en",
      countryCode: "gb"
    },
    nowIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(validateUserFoundationDocuments(documents), true);
  assert.equal(documents.user.authProvider, "password");
  assert.equal(documents.userProfile.displayName, "Ari");
  assert.equal(documents.userProfile.countryCode, "GB");
  assert.equal(documents.userProfile.subscriptionPlanId, "free");
});

test("@grwm/mobile leaves country blank when signup has not collected it", () => {
  const documents = createUserFoundationDocuments({
    authUser: {
      id: "user_1",
      email: "ari@example.com",
      emailVerified: false
    },
    nowIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(documents.userProfile.countryCode, "");
});

test("@grwm/mobile validates privacy consent source and feature gates", () => {
  const consent = createPrivacyConsentDocument({
    userId: "user_1",
    choices: {
      wardrobePhotoAnalysis: true,
      analytics: true
    },
    nowIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(validatePrivacyConsentDocument(consent), true);
  assert.equal(consent.source, "mobile");
  assert.equal(consent.analytics, true);
  assert.equal(canUseConsentGatedFeature(consent, "wardrobePhotoAnalysis"), true);
  assert.equal(canUseConsentGatedFeature(consent, "aiRecommendations"), false);
  assert.equal(consentGatedFeatureRequirements.weatherStyling, "locationWeatherUse");
  assert.deepEqual(optionalPrivacyConsentPurposes, ["marketingEmails", "analytics"]);
});

test("@grwm/mobile merges Settings privacy consent updates without changing untouched choices", () => {
  const existingChoices = createPrivacyConsentChoices({
    wardrobePhotoAnalysis: true,
    aiRecommendationUse: true
  });
  const mergedChoices = mergePrivacyConsentChoices(existingChoices, {
    marketingEmails: true,
    analytics: true
  });

  assert.equal(mergedChoices.wardrobePhotoAnalysis, true);
  assert.equal(mergedChoices.aiRecommendationUse, true);
  assert.equal(mergedChoices.avatarCreation, false);
  assert.equal(mergedChoices.marketingEmails, true);
  assert.equal(mergedChoices.analytics, true);
});

test("@grwm/mobile validates deletion request and style placeholder payloads", () => {
  const deletionRequest = createUserDeletionRequestDocument({
    userId: "user_1",
    nowIso: "2026-06-08T00:00:00.000Z"
  });
  const styleProfile = createStylePreferencePlaceholder({
    userId: "user_1",
    nowIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(validateUserDeletionRequestDocument(deletionRequest), true);
  assert.equal(deletionRequest.status, "requested");
  assert.equal(deletionRequest.requestedBy, "user");
  assert.equal(deletionRequest.source, "mobile");
  assert.equal(deletionRequest.failureReason, "");
  assert.equal(validateStylePreferencePlaceholder(styleProfile), true);
  assert.deepEqual(styleProfile.styleKeywords, []);
});

test("@grwm/mobile adapts AsyncStorage for Firebase Auth persistence", async () => {
  const storage = new Map<string, string>();
  const PersistenceClass = createAsyncStorageAuthPersistence({
    async getItem(key) {
      return storage.get(key) ?? null;
    },
    async setItem(key, value) {
      storage.set(key, value);
    },
    async removeItem(key) {
      storage.delete(key);
    }
  }) as unknown as {
    new (): {
      type: "LOCAL";
      _set(key: string, value: Record<string, unknown>): Promise<void>;
      _get<T>(key: string): Promise<T | null>;
      _remove(key: string): Promise<void>;
    };
  };
  const persistence = new PersistenceClass();

  assert.equal(persistence.type, "LOCAL");

  await persistence._set("auth", { uid: "user_1" });
  assert.deepEqual(await persistence._get("auth"), { uid: "user_1" });
  await persistence._remove("auth");
  assert.equal(await persistence._get("auth"), null);
});
