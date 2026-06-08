import assert from "node:assert/strict";
import test from "node:test";

import { functionsFoundation } from "./foundation.ts";
import { functionsEnvKeys, getFunctionsRuntimeConfig } from "./config.ts";
import { createUserProfileOnSignupContract } from "./placeholders/createUserProfileOnSignup.ts";
import { recordPrivacyConsentContract } from "./placeholders/recordPrivacyConsent.ts";
import { createPlaceholderResponse, functionPlaceholders } from "./placeholders/registry.ts";
import { requestUserDataDeletionContract } from "./placeholders/requestUserDataDeletion.ts";
import { validateAdminRoleContract } from "./placeholders/validateAdminRole.ts";

test("@grwm/functions targets Firebase Cloud Functions", () => {
  assert.equal(functionsFoundation.runtime, "firebase-cloud-functions");
});

test("@grwm/functions keeps sensitive logging disabled by default", () => {
  assert.equal(functionsFoundation.sensitiveLoggingAllowed, false);
});

test("@grwm/functions registers the Phase 1 placeholder functions", () => {
  assert.deepEqual(
    functionPlaceholders.map((placeholder) => placeholder.exportedName),
    [
      "wardrobeAnalysis",
      "dailyOutfitRecommendation",
      "occasionOutfitRecommendation",
      "avatarGenerationRequest",
      "userDataDeletion",
      "affiliateClickTracking",
      "subscriptionWebhook",
      "createUserProfileOnSignup",
      "requestUserDataDeletion",
      "logAdminAction",
      "recordPrivacyConsent",
      "validateAdminRole"
    ]
  );
});

test("@grwm/functions keeps placeholder responses explicit", () => {
  assert.deepEqual(createPlaceholderResponse("wardrobe-analysis", "user_1"), {
    ok: false,
    placeholderId: "wardrobe-analysis",
    status: "not-implemented",
    authenticatedUserId: "user_1",
    message: "This Firebase Function is reserved for a future implementation phase."
  });
});

test("@grwm/functions documents auth and privacy placeholder contracts", () => {
  assert.deepEqual(createUserProfileOnSignupContract.reservedWrites, ["users", "userProfiles"]);
  assert.equal(recordPrivacyConsentContract.source, "mobile");
  assert.deepEqual(recordPrivacyConsentContract.reservedWrites, ["privacyConsents"]);
  assert.deepEqual(requestUserDataDeletionContract.reservedWrites, ["userDeletionRequests"]);
  assert.equal(requestUserDataDeletionContract.clientDeletesDataImmediately, false);
  assert.deepEqual(validateAdminRoleContract.supportedRoles, [
    "owner",
    "admin",
    "moderator",
    "support",
    "analyst"
  ]);
});

test("@grwm/functions defines environment-backed runtime config", () => {
  assert.ok(functionsEnvKeys.includes("FIREBASE_PROJECT_ID"));
  assert.equal(getFunctionsRuntimeConfig().region, "us-central1");
});
