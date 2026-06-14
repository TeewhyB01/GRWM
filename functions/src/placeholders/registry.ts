export type FunctionPlaceholderId =
  | "wardrobe-analysis"
  | "daily-outfit-recommendation"
  | "occasion-outfit-recommendation"
  | "avatar-generation-request"
  | "affiliate-click-tracking"
  | "subscription-webhook"
  | "create-user-profile-on-signup"
  | "request-user-data-deletion"
  | "log-admin-action"
  | "record-privacy-consent"
  | "validate-admin-role";

export interface FunctionPlaceholder {
  id: FunctionPlaceholderId;
  exportedName: string;
  externalCallsEnabled: false;
  phase: "phase-1-shell";
}

export interface PlaceholderResponse {
  ok: false;
  placeholderId: FunctionPlaceholderId;
  status: "not-implemented";
  authenticatedUserId: string | null;
  message: string;
}

export const DEFAULT_FUNCTION_REGION = "us-central1";

export const functionPlaceholders: readonly FunctionPlaceholder[] = [
  {
    id: "wardrobe-analysis",
    exportedName: "wardrobeAnalysis",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "daily-outfit-recommendation",
    exportedName: "dailyOutfitRecommendation",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "occasion-outfit-recommendation",
    exportedName: "occasionOutfitRecommendation",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "avatar-generation-request",
    exportedName: "avatarGenerationRequest",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "affiliate-click-tracking",
    exportedName: "affiliateClickTracking",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "subscription-webhook",
    exportedName: "subscriptionWebhook",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "create-user-profile-on-signup",
    exportedName: "createUserProfileOnSignup",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "request-user-data-deletion",
    exportedName: "requestUserDataDeletion",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "log-admin-action",
    exportedName: "logAdminAction",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "record-privacy-consent",
    exportedName: "recordPrivacyConsent",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  },
  {
    id: "validate-admin-role",
    exportedName: "validateAdminRole",
    externalCallsEnabled: false,
    phase: "phase-1-shell"
  }
] as const;

export function createPlaceholderResponse(
  placeholderId: FunctionPlaceholderId,
  authenticatedUserId: string | null
): PlaceholderResponse {
  return {
    ok: false,
    placeholderId,
    status: "not-implemented",
    authenticatedUserId,
    message: "This Firebase Function is reserved for a future implementation phase."
  };
}
