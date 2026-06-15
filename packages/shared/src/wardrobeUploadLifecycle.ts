import {
  canRequestWardrobePhotoAnalysis,
  canUploadWardrobePhoto,
  type ConsentGateInput
} from "./consentGates.ts";
import type {
  WardrobeAnalysisRequestPayload,
  WardrobeCategory,
  WardrobeItem,
  WardrobeUploadDraft,
  WardrobeUploadFailureReason,
  WardrobeUploadMetadata,
  WardrobeUploadStatus
} from "./types.ts";
import {
  buildWardrobeUploadMetadata,
  getWardrobeUploadStoragePath,
  validateWardrobeUploadMetadata
} from "./wardrobeUploadMetadata.ts";
import {
  isClientWritableWardrobeItem,
  isSafeWardrobeLifecycleId,
  isWardrobeAnalysisRequestPayload,
  isWardrobeUploadFailureReason
} from "./validation.ts";

export const backendOwnedWardrobeFields = [
  "id",
  "itemId",
  "userId",
  "ownerId",
  "storagePath",
  "source",
  "uploadStatus",
  "uploadFailureReason",
  "uploadedAtIso",
  "uploadFailedAtIso",
  "analysisStatus",
  "analysisConsentVersion",
  "createdAtIso"
] as const satisfies readonly (keyof WardrobeItem)[];

export function isBackendOwnedWardrobeField(field: string): boolean {
  return backendOwnedWardrobeFields.includes(field as (typeof backendOwnedWardrobeFields)[number]);
}

export function createWardrobeUploadDraftData(params: {
  category?: WardrobeCategory;
  consent: ConsentGateInput;
  itemId: string;
  name?: string;
  notes?: string;
  nowIso: string;
  primaryColour?: string;
  source?: "manual" | "import";
  uploadStatus?: Extract<WardrobeUploadStatus, "draft" | "upload_pending">;
  userId: string;
}): WardrobeUploadDraft {
  if (!canUploadWardrobePhoto(params.consent)) {
    throw new Error("Privacy consent is required before creating a wardrobe upload draft.");
  }

  if (!isSafeWardrobeLifecycleId(params.userId) || !isSafeWardrobeLifecycleId(params.itemId)) {
    throw new Error("Invalid wardrobe upload draft identifier.");
  }

  const storagePath = getWardrobeUploadStoragePath({
    itemId: params.itemId,
    userId: params.userId
  });

  const draft: WardrobeUploadDraft = {
    id: params.itemId,
    itemId: params.itemId,
    userId: params.userId,
    ownerId: params.userId,
    name: normalizeWardrobeDraftText(params.name, "Wardrobe item", 80),
    notes: normalizeWardrobeDraftText(params.notes, "", 500),
    category: params.category ?? "other",
    primaryColour: normalizeWardrobeDraftText(params.primaryColour, "unknown", 40),
    colorTags: [],
    seasonTags: [],
    occasionTags: [],
    storagePath,
    visibility: "private",
    source: params.source ?? "manual",
    uploadStatus: params.uploadStatus ?? "upload_pending",
    uploadFailureReason: "",
    uploadedAtIso: "",
    uploadFailedAtIso: "",
    analysisStatus: "not_requested",
    analysisConsentVersion: "",
    createdAtIso: params.nowIso,
    updatedAtIso: params.nowIso
  };

  if (!canClientCreateWardrobeDraft(draft, params.userId)) {
    throw new Error("Invalid wardrobe upload draft.");
  }

  return draft;
}

export function buildWardrobeUploadMetadataForDraft(params: {
  consentVersion: string;
  draft: Pick<WardrobeItem, "category" | "itemId" | "ownerId" | "storagePath" | "userId">;
}): WardrobeUploadMetadata {
  const metadata = buildWardrobeUploadMetadata({
    category: params.draft.category,
    consentVersion: params.consentVersion,
    itemId: params.draft.itemId,
    ownerId: params.draft.ownerId,
    userId: params.draft.userId
  });

  if (
    !validateWardrobeUploadMetadata(metadata, {
      category: params.draft.category,
      storagePath: params.draft.storagePath
    })
  ) {
    throw new Error("Wardrobe upload metadata does not match the draft.");
  }

  return metadata;
}

function normalizeWardrobeDraftText(
  value: string | null | undefined,
  fallback: string,
  maxLength: number
): string {
  const normalized = value?.trim() ?? "";
  const text = normalized.length > 0 ? normalized : fallback;

  return text.slice(0, maxLength);
}

export function canClientCreateWardrobeDraft(
  draft: WardrobeItem,
  authenticatedUserId?: string
): boolean {
  return (
    isClientWritableWardrobeItem(draft) &&
    (authenticatedUserId === undefined || draft.userId === authenticatedUserId)
  );
}

export function canClientRequestWardrobeAnalysis(params: {
  consent: ConsentGateInput;
  payload: WardrobeAnalysisRequestPayload;
}): boolean {
  return (
    isWardrobeAnalysisRequestPayload(params.payload) &&
    canRequestWardrobePhotoAnalysis(params.consent) &&
    params.consent?.userId === params.payload.userId &&
    params.consent.version === params.payload.consentVersion
  );
}

export function getWardrobeUploadFailurePayload(params: {
  nowIso: string;
  reason: WardrobeUploadFailureReason;
}): Pick<WardrobeItem, "uploadFailedAtIso" | "uploadFailureReason" | "uploadStatus" | "updatedAtIso"> {
  if (!isWardrobeUploadFailureReason(params.reason)) {
    throw new Error("Invalid wardrobe upload failure reason.");
  }

  return {
    uploadStatus: "upload_failed",
    uploadFailureReason: params.reason,
    uploadFailedAtIso: params.nowIso,
    updatedAtIso: params.nowIso
  };
}

export {
  buildWardrobeUploadMetadata,
  getWardrobeUploadStoragePath,
  validateWardrobeUploadMetadata
} from "./wardrobeUploadMetadata.ts";
