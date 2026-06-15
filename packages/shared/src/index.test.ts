import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_ROLES,
  ALLOWED_AVATAR_SOURCE_CONTENT_TYPES,
  ALLOWED_STYLE_PHOTO_CONTENT_TYPES,
  ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES,
  MAX_AVATAR_SOURCE_IMAGE_BYTES,
  MAX_STYLE_PHOTO_IMAGE_BYTES,
  MAX_WARDROBE_IMAGE_BYTES,
  DEFAULT_LOCALE,
  FIREBASE_SERVICES,
  PRIVACY_CONSENT_PURPOSES,
  PRIVACY_CONSENT_VERSION,
  PRIVACY_FIRST_PRODUCT_PRINCIPLE,
  canAccessAdminConsole,
  canCreateAvatar,
  canRequestWardrobePhotoAnalysis,
  canUploadWardrobePhoto,
  canUseLocationWeather,
  createDefaultPrivacyConsent,
  firestoreCollections,
  futureUserOwnedFirestoreCollections,
  hasRequiredFields,
  isAllowedWardrobeImageContentType,
  isAdminRole,
  isClientWritableWardrobeItem,
  isSubscriptionPlanId,
  isWardrobeItemAnalysisStatus,
  privacyConsentSchema,
  storagePaths,
  STORAGE_UPLOAD_CATEGORIES,
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

test("@grwm/shared validates wardrobe item upload metadata shape", () => {
  const item: WardrobeItem = {
    id: "item_1",
    userId: "user_1",
    name: "Jacket",
    category: "outerwear",
    primaryColour: "navy",
    colorTags: ["navy"],
    seasonTags: ["spring"],
    occasionTags: ["work"],
    storagePath: "users/user_1/wardrobe/item_1/original",
    visibility: "private",
    source: "manual",
    analysisStatus: "not_requested",
    analysisConsentVersion: "",
    createdAtIso: "2026-06-08T00:00:00.000Z",
    updatedAtIso: "2026-06-08T00:00:00.000Z"
  };

  assert.equal(hasRequiredFields(item, validationSchemas.wardrobeItem), true);
  assert.equal(isClientWritableWardrobeItem(item), true);
  assert.equal(isWardrobeItemAnalysisStatus("completed"), true);
  assert.equal(isWardrobeItemAnalysisStatus("unsafe"), false);
  assert.equal(
    isClientWritableWardrobeItem({
      ...item,
      analysisStatus: "completed"
    }),
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
  assert.throws(() => storagePaths.wardrobeOriginal("", "item_1"));
  assert.throws(() => storagePaths.wardrobeOriginal("user_1", "nested/item"));
  assert.throws(() => storagePaths.wardrobeOriginal(" user_1", "item_1"));
});

test("@grwm/shared defines upload policy constants", () => {
  assert.deepEqual(ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES, [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
  ]);
  assert.deepEqual(ALLOWED_STYLE_PHOTO_CONTENT_TYPES, ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES);
  assert.deepEqual(ALLOWED_AVATAR_SOURCE_CONTENT_TYPES, ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES);
  assert.equal(MAX_WARDROBE_IMAGE_BYTES, 10 * 1024 * 1024);
  assert.equal(MAX_STYLE_PHOTO_IMAGE_BYTES, 10 * 1024 * 1024);
  assert.equal(MAX_AVATAR_SOURCE_IMAGE_BYTES, 10 * 1024 * 1024);
  assert.deepEqual(STORAGE_UPLOAD_CATEGORIES, [
    "wardrobe-original",
    "style-photo-original",
    "avatar-source-original",
    "avatar-generated",
    "outfit"
  ]);
  assert.equal(isAllowedWardrobeImageContentType("image/webp"), true);
  assert.equal(isAllowedWardrobeImageContentType("application/pdf"), false);
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

test("@grwm/shared gates upload-adjacent privacy decisions", () => {
  const consent = createDefaultPrivacyConsent({
    id: "consent_1",
    userId: "user_1",
    createdAtIso: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(canUploadWardrobePhoto(consent), true);
  assert.equal(canRequestWardrobePhotoAnalysis(consent), false);
  assert.equal(canUseLocationWeather(consent), false);
  assert.equal(canCreateAvatar(consent), false);

  assert.equal(canRequestWardrobePhotoAnalysis({ ...consent, wardrobePhotoAnalysis: true }), true);
  assert.equal(canUseLocationWeather({ ...consent, locationWeatherUse: true }), true);
  assert.equal(canCreateAvatar({ ...consent, avatarCreation: true }), true);
  assert.equal(canUploadWardrobePhoto(null), false);
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
