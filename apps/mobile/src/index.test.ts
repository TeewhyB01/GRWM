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
  continueWithLocalQaAccount,
  createDefaultWardrobeStyleBasics,
  createLocalQaCredentials,
  createStylePreferencePlaceholder,
  createUserDeletionRequestDocument,
  createUserFoundationDocuments,
  createWardrobeSetupProfileDocument,
  getQaAccessState,
  getMobileFirebaseConfig,
  getMobileFirebaseEmulatorConfig,
  getNextRouteForAuthAndConsent,
  getMessages,
  isQaAccessEnabled,
  isMobileFirebaseConfigured,
  mergePrivacyConsentChoices,
  mergeWardrobeStyleBasics,
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
  validateWardrobeSetupProfileDocument,
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

function createSafeLocalFirebaseConfig(useEmulators = true) {
  return {
    apiKey: "demo-api-key",
    authDomain: "demo-grwm.firebaseapp.com",
    projectId: "demo-grwm",
    storageBucket: "demo-grwm.appspot.com",
    messagingSenderId: "000000000000",
    appId: "demo-grwm-mobile",
    useEmulators,
    emulators: {
      auth: {
        host: "127.0.0.1",
        port: 9099,
        url: "http://127.0.0.1:9099"
      },
      firestore: {
        host: "127.0.0.1",
        port: 8080
      }
    }
  };
}

function createQaEnabledEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    GRWM_APP_ENV: "development",
    GRWM_ENABLE_QA_ACCESS: "true",
    NODE_ENV: "development",
    ...overrides
  };
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
      "wardrobeSetupIntro",
      "wardrobeSetupPrivacy",
      "wardrobeSetupCategories",
      "wardrobeSetupStyle",
      "wardrobeSetupSummary",
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

test("@grwm/mobile keeps local QA access disabled by default", () => {
  const state = getQaAccessState({
    env: {
      GRWM_APP_ENV: "development",
      NODE_ENV: "development"
    },
    firebaseConfig: createSafeLocalFirebaseConfig()
  });

  assert.equal(state.enabled, false);
  assert.equal(state.reason, "missing_explicit_flag");
  assert.equal(
    isQaAccessEnabled({
      env: {
        GRWM_APP_ENV: "development",
        NODE_ENV: "development"
      },
      firebaseConfig: createSafeLocalFirebaseConfig()
    }),
    false
  );
});

test("@grwm/mobile enables local QA access only in development emulator mode", () => {
  assert.deepEqual(
    getQaAccessState({
      env: createQaEnabledEnv(),
      firebaseConfig: createSafeLocalFirebaseConfig()
    }),
    {
      enabled: true,
      reason: "enabled"
    }
  );
  assert.deepEqual(
    getQaAccessState({
      env: createQaEnabledEnv(),
      firebaseConfig: createSafeLocalFirebaseConfig(false)
    }),
    {
      enabled: false,
      reason: "firebase_emulators_disabled"
    }
  );
});

test("@grwm/mobile blocks local QA access in production even when flagged on", () => {
  assert.deepEqual(
    getQaAccessState({
      env: createQaEnabledEnv({
        GRWM_APP_ENV: "production",
        NODE_ENV: "production"
      }),
      firebaseConfig: createSafeLocalFirebaseConfig()
    }),
    {
      enabled: false,
      reason: "production_runtime"
    }
  );
  assert.deepEqual(
    getQaAccessState({
      env: createQaEnabledEnv(),
      firebaseConfig: {
        ...createSafeLocalFirebaseConfig(),
        authDomain: "grwm-prod.firebaseapp.com",
        projectId: "grwm-prod",
        storageBucket: "grwm-prod.appspot.com"
      }
    }),
    {
      enabled: false,
      reason: "production_firebase_config"
    }
  );
});

test("@grwm/mobile blocks local QA access when React Native production flag is active", () => {
  const runtimeGlobal = globalThis as typeof globalThis & { __DEV__?: boolean };
  const previousDevFlag = runtimeGlobal.__DEV__;

  try {
    runtimeGlobal.__DEV__ = false;

    assert.deepEqual(
      getQaAccessState({
        env: createQaEnabledEnv(),
        firebaseConfig: createSafeLocalFirebaseConfig()
      }),
      {
        enabled: false,
        reason: "production_runtime"
      }
    );
  } finally {
    if (previousDevFlag === undefined) {
      delete runtimeGlobal.__DEV__;
    } else {
      runtimeGlobal.__DEV__ = previousDevFlag;
    }
  }
});

test("@grwm/mobile generates safe local QA credentials without a stored real password", () => {
  const credentials = createLocalQaCredentials({
    env: {
      GRWM_QA_EMAIL_PREFIX: " Wardrobe QA! "
    },
    now: new Date("2026-06-15T10:20:30.000Z"),
    randomToken: "ABC-123"
  });

  assert.equal(credentials.email, "wardrobeqa+20260615102030+abc123@example.test");
  assert.equal(credentials.password, "local-qa-20260615102030-abc123");
  assert.doesNotMatch(credentials.password, /secret|credential|token|password/i);
});

test("@grwm/mobile local QA helper creates only auth and foundation profile documents", async () => {
  const actions: string[] = [];
  const now = new Date("2026-06-15T10:20:30.000Z");
  const result = await continueWithLocalQaAccount(
    {
      env: createQaEnabledEnv(),
      firebaseConfig: createSafeLocalFirebaseConfig(),
      now,
      randomToken: "qa1"
    },
    {
      async createAuthUser(credentials) {
        actions.push("auth:create-user");

        return {
          id: "local-qa-user",
          email: credentials.email,
          emailVerified: false
        };
      },
      async ensureUserDocuments({ authUser, nowIso }) {
        actions.push("firestore:users");
        actions.push("firestore:userProfiles");

        return createUserFoundationDocuments({
          authUser,
          nowIso
        });
      },
      async recordPrivacyConsent({ choices, userId }) {
        actions.push("firestore:privacyConsents");

        return createPrivacyConsentDocument({
          choices,
          userId,
          nowIso: now.toISOString()
        });
      }
    }
  );

  assert.equal(result.user.id, "local-qa-user");
  assert.deepEqual(actions, ["auth:create-user", "firestore:users", "firestore:userProfiles"]);
  assert.equal(actions.includes("firestore:wardrobeSetupProfiles"), false);
  assert.equal(actions.includes("firestore:wardrobeItems"), false);
  assert.equal(actions.includes("storage:upload"), false);
  assert.equal(actions.includes("firestore:aiJobs"), false);
  assert.equal(result.privacyConsent, null);
});

test("@grwm/mobile local QA helper records privacy consent only when explicitly requested", async () => {
  const actions: string[] = [];
  const now = new Date("2026-06-15T10:20:30.000Z");
  const result = await continueWithLocalQaAccount(
    {
      createPrivacyConsent: true,
      env: createQaEnabledEnv(),
      firebaseConfig: createSafeLocalFirebaseConfig(),
      now,
      privacyConsentChoices: {
        analytics: true
      },
      randomToken: "qa2"
    },
    {
      async createAuthUser(credentials) {
        actions.push("auth:create-user");

        return {
          id: "local-qa-user",
          email: credentials.email,
          emailVerified: false
        };
      },
      async ensureUserDocuments({ authUser, nowIso }) {
        actions.push("firestore:users");
        actions.push("firestore:userProfiles");

        return createUserFoundationDocuments({
          authUser,
          nowIso
        });
      },
      async recordPrivacyConsent({ choices, userId }) {
        actions.push("firestore:privacyConsents");

        return createPrivacyConsentDocument({
          choices,
          userId,
          nowIso: now.toISOString()
        });
      }
    }
  );

  assert.deepEqual(actions, [
    "auth:create-user",
    "firestore:users",
    "firestore:userProfiles",
    "firestore:privacyConsents"
  ]);
  assert.equal(result.privacyConsent?.analytics, true);
  assert.equal(actions.includes("firestore:wardrobeSetupProfiles"), false);
  assert.equal(actions.includes("firestore:wardrobeItems"), false);
  assert.equal(actions.includes("storage:upload"), false);
  assert.equal(actions.includes("firestore:aiJobs"), false);
});

test("@grwm/mobile guards protected routes until auth exists", () => {
  assert.equal(canAccessMobileRoute("wardrobe", createCheckingAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createPlaceholderSignedInAuthState()), true);
  assert.equal(canAccessMobileRoute("wardrobeSetupIntro", createPlaceholderSignedInAuthState()), true);
  assert.equal(canAccessMobileRoute("wardrobeSetupStyle", createSignedOutAuthState()), false);
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

test("@grwm/mobile keeps wardrobe setup i18n keys present", () => {
  const messages = getMessages();

  assert.equal(messages.screens.qaAccess.action, "Continue with local QA account");
  assert.match(messages.screens.qaAccess.copy, /Local emulator QA only/);
  assert.match(messages.screens.qaAccess.copy, /Hidden in production/);
  assert.equal(messages.screens.wardrobeSetupIntro.privateTitle, "Your wardrobe is private.");
  assert.match(messages.screens.wardrobeSetupIntro.consentBody, /will not analyse wardrobe photos/);
  assert.match(messages.screens.wardrobeSetupIntro.consentBody, /Photo upload will be added/);
  assert.match(messages.screens.wardrobePrivacyExplainer.consentBody, /Settings/);
  assert.equal(messages.screens.wardrobeSetupCategories.categoryLabels.traditional_cultural_clothing, "Traditional or cultural clothing");
  assert.equal(messages.screens.wardrobe.addSoonAction, "Add wardrobe item soon");
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

test("@grwm/mobile builds wardrobe setup profile payloads without image upload fields", () => {
  const styleBasics = mergeWardrobeStyleBasics(createDefaultWardrobeStyleBasics(), {
    typicalDressCode: "smart_casual",
    preferredOutfitFormality: "balanced",
    favouriteColourFamilies: ["black", "green"],
    workwearRelevance: "often"
  });
  const profile = createWardrobeSetupProfileDocument({
    nowIso: "2026-06-15T00:00:00.000Z",
    selectedCategories: ["tops", "jeans", "jackets"],
    setupStatus: "completed",
    styleBasics,
    userId: "user_1"
  });

  assert.equal(validateWardrobeSetupProfileDocument(profile), true);
  assert.equal(profile.id, "user_1");
  assert.equal(profile.userId, "user_1");
  assert.equal(profile.source, "mobile");
  assert.equal(profile.setupStatus, "completed");
  assert.equal(profile.completedAt, "2026-06-15T00:00:00.000Z");
  assert.deepEqual(profile.selectedCategories, ["tops", "jeans", "jackets"]);
  assert.equal("storagePath" in profile, false);
  assert.equal("uploadStatus" in profile, false);
  assert.equal("analysisStatus" in profile, false);
});

test("@grwm/mobile preserves wardrobe setup createdAt during draft updates", () => {
  const existingProfile = createWardrobeSetupProfileDocument({
    nowIso: "2026-06-15T00:00:00.000Z",
    selectedCategories: ["tops"],
    userId: "user_1"
  });
  const updatedProfile = createWardrobeSetupProfileDocument({
    existingProfile,
    nowIso: "2026-06-15T00:05:00.000Z",
    selectedCategories: ["tops", "shoes"],
    userId: "user_1"
  });

  assert.equal(updatedProfile.setupStatus, "in_progress");
  assert.equal(updatedProfile.createdAt, existingProfile.createdAt);
  assert.equal(updatedProfile.updatedAt, "2026-06-15T00:05:00.000Z");
  assert.equal(updatedProfile.completedAt, "");
  assert.deepEqual(updatedProfile.selectedCategories, ["tops", "shoes"]);
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
