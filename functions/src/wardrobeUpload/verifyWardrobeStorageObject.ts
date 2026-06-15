import {
  MAX_WARDROBE_IMAGE_BYTES,
  isAllowedWardrobeImageContentType,
  isWardrobeCategory,
  parseWardrobeUploadStoragePath,
  validateWardrobeUploadMetadata,
  type WardrobeUploadFailureReason,
  type WardrobeUploadMetadata
} from "@grwm/shared";

export interface WardrobeStorageObjectSnapshot {
  contentType?: string | null | undefined;
  metadata?: Record<string, string | undefined> | null | undefined;
  name?: string | null | undefined;
  size?: number | string | null | undefined;
}

export interface VerifiedWardrobeStorageObject {
  contentType: string;
  itemId: string;
  metadata: WardrobeUploadMetadata;
  sizeBytes: number;
  storagePath: string;
  userId: string;
}

export type WardrobeStorageObjectVerification =
  | ({
      ok: true;
    } & VerifiedWardrobeStorageObject)
  | {
      failureReason: WardrobeUploadFailureReason;
      itemId: string;
      ok: false;
      storagePath: string;
      userId: string;
    };

function readWardrobeUploadMetadata(
  metadata: Record<string, string | undefined> | null | undefined
): WardrobeUploadMetadata | null {
  if (!metadata) {
    return null;
  }

  const candidate = {
    ownerId: metadata.ownerId,
    userId: metadata.userId,
    itemId: metadata.itemId,
    category: metadata.category,
    uploadCategory: metadata.uploadCategory,
    consentVersion: metadata.consentVersion,
    storagePath: metadata.storagePath
  };

  if (
    typeof candidate.ownerId !== "string" ||
    typeof candidate.userId !== "string" ||
    typeof candidate.itemId !== "string" ||
    typeof candidate.category !== "string" ||
    !isWardrobeCategory(candidate.category) ||
    candidate.uploadCategory !== "wardrobe-original" ||
    typeof candidate.consentVersion !== "string" ||
    typeof candidate.storagePath !== "string"
  ) {
    return null;
  }

  return {
    ownerId: candidate.ownerId,
    userId: candidate.userId,
    itemId: candidate.itemId,
    category: candidate.category,
    uploadCategory: candidate.uploadCategory,
    consentVersion: candidate.consentVersion,
    storagePath: candidate.storagePath
  };
}

function readSizeBytes(size: number | string | null | undefined): number {
  if (typeof size === "number") {
    return size;
  }

  if (typeof size === "string") {
    return Number.parseInt(size, 10);
  }

  return Number.NaN;
}

function failure(params: {
  failureReason: WardrobeUploadFailureReason;
  itemId?: string;
  storagePath?: string;
  userId?: string;
}): WardrobeStorageObjectVerification {
  return {
    ok: false,
    failureReason: params.failureReason,
    itemId: params.itemId ?? "",
    storagePath: params.storagePath ?? "",
    userId: params.userId ?? ""
  };
}

export function verifyWardrobeStorageObject(
  object: WardrobeStorageObjectSnapshot
): WardrobeStorageObjectVerification {
  const storagePath = object.name ?? "";
  const parsedPath = parseWardrobeUploadStoragePath(storagePath);

  if (!parsedPath) {
    return failure({
      failureReason: "invalid_storage_path",
      storagePath
    });
  }

  const metadata = readWardrobeUploadMetadata(object.metadata);

  if (!metadata) {
    return failure({
      failureReason: "missing_required_metadata",
      itemId: parsedPath.itemId,
      storagePath,
      userId: parsedPath.userId
    });
  }

  if (
    !validateWardrobeUploadMetadata(metadata, {
      itemId: parsedPath.itemId,
      storagePath,
      userId: parsedPath.userId
    })
  ) {
    return failure({
      failureReason: "metadata_mismatch",
      itemId: parsedPath.itemId,
      storagePath,
      userId: parsedPath.userId
    });
  }

  if (typeof object.contentType !== "string" || !isAllowedWardrobeImageContentType(object.contentType)) {
    return failure({
      failureReason: "invalid_content_type",
      itemId: parsedPath.itemId,
      storagePath,
      userId: parsedPath.userId
    });
  }

  const sizeBytes = readSizeBytes(object.size);

  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0 || sizeBytes > MAX_WARDROBE_IMAGE_BYTES) {
    return failure({
      failureReason: "file_too_large",
      itemId: parsedPath.itemId,
      storagePath,
      userId: parsedPath.userId
    });
  }

  return {
    ok: true,
    contentType: object.contentType,
    itemId: parsedPath.itemId,
    metadata,
    sizeBytes,
    storagePath,
    userId: parsedPath.userId
  };
}
