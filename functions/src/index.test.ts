import assert from "node:assert/strict";
import test from "node:test";

import { functionsFoundation } from "./foundation.ts";
import { createPlaceholderResponse, functionPlaceholders } from "./placeholders/registry.ts";

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
      "subscriptionWebhook"
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
