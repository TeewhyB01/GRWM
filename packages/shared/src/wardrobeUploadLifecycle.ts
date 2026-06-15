import {
  canRequestWardrobePhotoAnalysis,
  canUploadWardrobePhoto,
  type ConsentGateInput
} from "./consentGates.ts";
import type {
  WardrobeAnalysisRequestPayload,
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
  consent: ConsentGateInput;
  itemId: string;
  nowIso: string;
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
    name: "Wardrobe item",
    category: "other",
    primaryColour: "unknown",
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
  draft: Pick<WardrobeItem, "itemId" | "ownerId" | "storagePath" | "userId">;
}): WardrobeUploadMetadata {
  const metadata = buildWardrobeUploadMetadata({
    consentVersion: params.consentVersion,
    itemId: params.draft.itemId,
    ownerId: params.draft.ownerId,
    userId: params.draft.userId
  });

  if (!validateWardrobeUploadMetadata(metadata, { storagePath: params.draft.storagePath })) {
    throw new Error("Wardrobe upload metadata does not match the draft.");
  }

  return metadata;
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
