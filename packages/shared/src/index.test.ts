import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_ROLES,
  DEFAULT_LOCALE,
  FIREBASE_SERVICES,
  PRIVACY_CONSENT_PURPOSES,
  PRIVACY_CONSENT_VERSION,
  PRIVACY_FIRST_PRODUCT_PRINCIPLE,
  canAccessAdminConsole,
  createDefaultPrivacyConsent,
  firestoreCollections,
  futureUserOwnedFirestoreCollections,
  hasRequiredFields,
  isAdminRole,
  isSubscriptionPlanId,
  privacyConsentSchema,
  storagePaths,
  userDeletionRequestSchema,
  userProfileSchema,
  validationSchemas,
  type WardrobeItem
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
  assert.equal(validationSchemas.privacyConsent, privacyConsentSchema);
  assert.equal(validationSchemas.userDeletionRequest, userDeletionRequestSchema);
  assert.equal(isSubscriptionPlanId("premium"), true);
  assert.equal(isSubscriptionPlanId("enterprise"), false);
});

test("@grwm/shared validates required profile fields without external dependencies", () => {
  assert.equal(
    hasRequiredFields(
      {
        id: "user_1",
        userId: "user_1",
        displayName: "Ari",
        locale: "en",
        countryCode: "GB",
        subscriptionPlanId: "free",
        privacyConsentVersion: "2026-06",
        createdAtIso: "2026-06-08T00:00:00.000Z",
        updatedAtIso: "2026-06-08T00:00:00.000Z"
      },
      userProfileSchema
    ),
    true
  );
});

test("@grwm/shared rejects incomplete required schema payloads", () => {
  assert.equal(
    hasRequiredFields<WardrobeItem>(
      {
        id: "item_1",
        userId: "user_1",
        name: "Jacket",
        category: "outerwear",
        storagePath: "users/user_1/wardrobe/item_1/original",
        visibility: "private"
      },
      validationSchemas.wardrobeItem
    ),
    false
  );
});

test("@grwm/shared defines the Firestore collection contract", () => {
  assert.deepEqual(Object.values(firestoreCollections), [
    "users",
    "userProfiles",
    "privacyConsents",
    "wardrobeItems",
    "styleProfiles",
    "outfitRecommendations",
    "avatarProfiles",
    "subscriptions",
    "adminUsers",
    "adminAuditLogs",
    "userDeletionRequests"
  ]);
  assert.deepEqual(futureUserOwnedFirestoreCollections, [
    "savedOutfits",
    "wornOutfits",
    "outfitPhotos",
    "avatarGenerations",
    "shoppingRecommendations",
    "affiliateClicks",
    "payments",
    "aiJobs",
    "aiUsageLogs",
    "userFeedback",
    "reports"
  ]);
});

test("@grwm/shared defines private Firebase Storage paths", () => {
  assert.equal(storagePaths.wardrobeOriginal("user_1", "item_1").path, "users/user_1/wardrobe/item_1/original");
  assert.equal(storagePaths.stylePhotoOriginal("user_1", "photo_1").path, "users/user_1/style-photos/photo_1/original");
  assert.equal(storagePaths.avatarSourceOriginal("user_1", "photo_1").path, "users/user_1/avatar/source/photo_1/original");
  assert.equal(storagePaths.avatarGenerated("user_1", "generation_1").path, "users/user_1/avatar/generated/generation_1");
  assert.equal(storagePaths.outfit("user_1", "outfit_1").path, "users/user_1/outfits/outfit_1");
  assert.throws(() => storagePaths.outfit("user_1", "../bad"));
});

test("@grwm/shared models privacy consent purposes as opt-in defaults", () => {
  const consent = createDefaultPrivacyConsent({
    id: "consent_1",
    userId: "user_1",
    createdAtIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(consent.version, PRIVACY_CONSENT_VERSION);
  assert.equal(consent.source, "mobile");
  assert.deepEqual(PRIVACY_CONSENT_PURPOSES, [
    "wardrobePhotoAnalysis",
    "stylePhotoAnalysis",
    "avatarCreation",
    "locationWeatherUse",
    "aiRecommendationUse",
    "marketingEmails",
    "analytics"
  ]);
  assert.equal(consent.wardrobePhotoAnalysis, false);
  assert.equal(consent.avatarCreation, false);
});

test("@grwm/shared validates style preference placeholders", () => {
  assert.equal(
    hasRequiredFields(
      {
        id: "user_1",
        userId: "user_1",
        preferredColors: [],
        avoidedColors: [],
        preferredFits: [],
        styleKeywords: [],
        occasionPriorities: [],
        modestyPreference: "",
        weatherLocationPreference: "",
        bodyShapeNotesPrivate: "",
        createdAtIso: "2026-06-08T00:00:00.000Z",
        updatedAtIso: "2026-06-08T00:00:00.000Z"
      },
      validationSchemas.styleProfile
    ),
    true
  );
});

test("@grwm/shared defines admin roles and console entitlement helpers", () => {
  assert.deepEqual(ADMIN_ROLES, ["owner", "admin", "moderator", "support", "analyst"]);
  assert.equal(isAdminRole("moderator"), true);
  assert.equal(isAdminRole("stylist-ops"), false);
  assert.equal(canAccessAdminConsole(["support"]), true);
});
