import assert from "node:assert/strict";
import test from "node:test";

import {
  canAccessMobileRoute,
  createPlaceholderSignedInAuthState,
  createSignedOutAuthState,
  isMobileFirebaseConfigured,
  mapFirebaseAuthUser,
  mobileFirebaseEnvKeys,
  mobileFoundation,
  mobileRoutes,
  socialLoginTodos,
  supportedLocales,
  themes
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
    ["welcome", "login", "signUp", "language", "country", "onboarding", "wardrobe", "today", "settings"]
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
  assert.equal(canAccessMobileRoute("wardrobe", createSignedOutAuthState()), false);
  assert.equal(canAccessMobileRoute("wardrobe", createPlaceholderSignedInAuthState()), true);
  assert.equal(canAccessMobileRoute("login", createSignedOutAuthState()), true);
});
