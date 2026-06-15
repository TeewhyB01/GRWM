import type {
  PrivacyConsent,
  WardrobeCategory,
  WardrobeItem,
  WardrobeUploadDraft,
  WardrobeUploadMetadata
} from "@grwm/shared";

export interface WardrobeImageAssetInput {
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  type?: string | null;
  uri: string;
}

export type WardrobeUploadValidationCode =
  | "auth_required"
  | "file_missing"
  | "invalid_asset_type"
  | "unsupported_content_type"
  | "invalid_file_size"
  | "file_too_large"
  | "category_required"
  | "primary_colour_required";

export interface WardrobeValidatedImage {
  contentType: WardrobeUploadMetadataContentType;
  fileName: string;
  sizeBytes: number | null;
  uri: string;
}

export type WardrobeUploadMetadataContentType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heic"
  | "image/heif";

export type WardrobeImageValidationResult =
  | {
      image: WardrobeValidatedImage;
      ok: true;
    }
  | {
      code: WardrobeUploadValidationCode;
      message: string;
      ok: false;
    };

export interface WardrobeUploadProgressSnapshot {
  bytesTransferred: number;
  percent: number;
  totalBytes: number;
}

export interface WardrobeUploadRequest {
  asset: WardrobeImageAssetInput | null;
  category: WardrobeCategory | "";
  consent: PrivacyConsent | null;
  name?: string;
  notes?: string;
  onProgress?: (progress: WardrobeUploadProgressSnapshot) => void;
  primaryColour: string;
  userId: string | null;
}

export interface WardrobeUploadPlan {
  contentType: WardrobeUploadMetadataContentType;
  draft: WardrobeUploadDraft;
  itemId: string;
  metadata: WardrobeUploadMetadata;
  storagePath: string;
}

export interface WardrobeUploadDependencies {
  createDraft(params: {
    draft: WardrobeUploadDraft;
    itemId: string;
  }): Promise<void>;
  createItemId(): string;
  nowIso(): string;
  uploadOriginal(params: {
    assetUri: string;
    contentType: WardrobeUploadMetadataContentType;
    metadata: WardrobeUploadMetadata;
    onProgress?: (progress: WardrobeUploadProgressSnapshot) => void;
    storagePath: string;
  }): Promise<void>;
}

export interface WardrobeUploadResult {
  itemId: string;
  storagePath: string;
}

export interface WardrobeUploadOperation {
  cancel(): void;
  promise: Promise<WardrobeUploadResult>;
}

export type WardrobeUploadPhase =
  | "idle"
  | "validating"
  | "draft"
  | "uploading"
  | "processing"
  | "saved_processing"
  | "uploaded"
  | "failed";

export interface WardrobeListItem extends WardrobeItem {
  notes: string;
}
