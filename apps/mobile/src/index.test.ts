import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessMobileRoute,
  canUseConsentGatedFeature,
  consentGatedFeatureRequirements,
  createAsyncStorageAuthPersistence,
  createCheckingAuthState,
  createPrivacyConsentDocument,
  createPlaceholderSignedInAuthState,
  createSignedOutAuthState,
  createStylePreferencePlaceholder,
  createUserDeletionRequestDocument,
  createUserFoundationDocuments,
  isMobileFirebaseConfigured,
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

test("@grwm/mobile requires a development build instead of Expo Go", () => {
  assert.equal(mobileFoundation.expoGoSupported, false);
  assert.equal(mobileFoundation.developmentBuildRequired, true);
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
  assert.deepEqual(mapFirebaseAuthUser({ uid: "user_1", email: "ari@example.com", emailVerified: true }), {
    id: "user_1",
    email: "ari@example.com",
    emailVerified: true
  });
  assert.equal(socialLoginTodos.length, 2);
});

test("@grwm/mobile guards protected routes until auth exists", () => {
  assert.equal(canAccessMobileRoute("wardrobe", createCheckingAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createPlaceholderSignedInAuthState()), true);
  assert.equal(canAccessMobileRoute("privacy", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("login", createSignedOutAuthState()), true);
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
  assert.equal(validateStylePreferencePlaceholder(styleProfile), true);
  assert.deepEqual(styleProfile.styleKeywords, []);
});

test("@grwm/mobile adapts AsyncStorage for Firebase Auth persistence", async () => {
  const storage = new Map<string, string>();
  const persistence = createAsyncStorageAuthPersistence({
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
    _set(key: string, value: Record<string, unknown>): Promise<void>;
    _get<T>(key: string): Promise<T | null>;
    _remove(key: string): Promise<void>;
  };

  await persistence._set("auth", { uid: "user_1" });
  assert.deepEqual(await persistence._get("auth"), { uid: "user_1" });
  await persistence._remove("auth");
  assert.equal(await persistence._get("auth"), null);
});
