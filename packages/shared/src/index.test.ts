import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LOCALE,
  FIREBASE_SERVICES,
  PRIVACY_FIRST_PRODUCT_PRINCIPLE,
  hasRequiredFields,
  isSubscriptionPlanId,
  userProfileSchema,
  validationSchemas
} from "./index.ts";

test("@grwm/shared keeps English as the launch locale", () => {
  assert.equal(DEFAULT_LOCALE, "en");
});

test("@grwm/shared documents required Firebase services", () => {
  assert.ok(FIREBASE_SERVICES.includes("authentication"));
  assert.ok(FIREBASE_SERVICES.includes("cloud-firestore"));
  assert.ok(FIREBASE_SERVICES.includes("storage"));
  assert.ok(FIREBASE_SERVICES.includes("cloud-functions"));
});

test("@grwm/shared keeps privacy first in the shared foundation", () => {
  assert.match(PRIVACY_FIRST_PRODUCT_PRINCIPLE, /needed/);
});

test("@grwm/shared exposes Phase 1 validation schema metadata", () => {
  assert.equal(validationSchemas.userProfile, userProfileSchema);
  assert.equal(isSubscriptionPlanId("premium"), true);
  assert.equal(isSubscriptionPlanId("enterprise"), false);
});

test("@grwm/shared validates required profile fields without external dependencies", () => {
  assert.equal(
    hasRequiredFields(
      {
        id: "user_1",
        displayName: "Ari",
        locale: "en",
        countryCode: "GB",
        subscriptionPlanId: "free",
        privacyConsentVersion: "2026-06"
      },
      userProfileSchema
    ),
    true
  );
});
