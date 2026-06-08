import assert from "node:assert/strict";
import test from "node:test";

import { mobileFoundation, mobileRoutes, supportedLocales, themes } from "./index.ts";

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
