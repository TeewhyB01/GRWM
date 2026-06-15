import {
  parseWardrobeUploadStoragePath,
  storagePaths,
  validateWardrobeUploadMetadata,
  type WardrobeUploadMetadata,
  type WardrobeUploadStatus
} from "@grwm/shared";

export interface WardrobeStorageObjectReference {
  metadata?: Partial<WardrobeUploadMetadata>;
  name: string;
}

export interface WardrobeItemStorageReference {
  id: string;
  userId: string;
  storagePath: string;
  updatedAtIso?: string;
  uploadStatus?: WardrobeUploadStatus;
}

export interface WardrobeOrphanScanResult {
  failedWardrobeItemIdsNeedingReview: readonly string[];
  metadataMismatchStorageObjectPaths: readonly string[];
  orphanedStorageObjectPaths: readonly string[];
  pendingWardrobeItemIdsPastThreshold: readonly string[];
  wardrobeItemIdsMissingStorageObjects: readonly string[];
}

export const wardrobeOrphanCleanupPolicy = {
  destructiveCleanupEnabled: false,
  mustRunServerSide: true,
  uploadPendingAgeThresholdMs: 24 * 60 * 60 * 1000,
  reason:
    "Wardrobe orphan cleanup compares private Storage objects with Firestore records and must use trusted Admin SDK access, audit logging, and retry-safe deletes."
} as const;

export function wardrobeStoragePrefix(userId: string): string {
  return `users/${userId}/wardrobe/`;
}

export function isWardrobeOriginalStoragePath(path: string): boolean {
  return parseWardrobeUploadStoragePath(path) !== null;
}

function toTimeMs(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const time = Date.parse(value);

  return Number.isNaN(time) ? null : time;
}

function hasMetadataMismatch(object: WardrobeStorageObjectReference): boolean {
  const parsedPath = parseWardrobeUploadStoragePath(object.name);

  if (!parsedPath) {
    return false;
  }

  const metadata = object.metadata;

  if (!metadata) {
    return true;
  }

  return !validateWardrobeUploadMetadata({
    ownerId: metadata.ownerId ?? "",
    userId: metadata.userId ?? "",
    itemId: metadata.itemId ?? "",
    uploadCategory: metadata.uploadCategory ?? "wardrobe-original",
    consentVersion: metadata.consentVersion ?? "",
    storagePath: metadata.storagePath ?? ""
  }, {
    itemId: parsedPath.itemId,
    storagePath: object.name,
    userId: parsedPath.userId
  });
}

export function detectWardrobeStorageOrphans(params: {
  nowIso?: string;
  storageObjects: readonly WardrobeStorageObjectReference[];
  uploadPendingAgeThresholdMs?: number;
  wardrobeItems: readonly WardrobeItemStorageReference[];
}): WardrobeOrphanScanResult {
  const nowMs = toTimeMs(params.nowIso) ?? Date.now();
  const pendingAgeThresholdMs =
    params.uploadPendingAgeThresholdMs ?? wardrobeOrphanCleanupPolicy.uploadPendingAgeThresholdMs;
  const wardrobeItemStoragePaths = new Set(params.wardrobeItems.map((item) => item.storagePath));
  const wardrobeStorageObjectPaths = new Set(
    params.storageObjects
      .map((object) => object.name)
      .filter((name) => isWardrobeOriginalStoragePath(name))
  );

  return {
    failedWardrobeItemIdsNeedingReview: params.wardrobeItems
      .filter((item) => item.uploadStatus === "upload_failed")
      .map((item) => item.id),
    metadataMismatchStorageObjectPaths: params.storageObjects
      .filter((object) => isWardrobeOriginalStoragePath(object.name))
      .filter((object) => hasMetadataMismatch(object))
      .map((object) => object.name),
    orphanedStorageObjectPaths: [...wardrobeStorageObjectPaths].filter(
      (path) => !wardrobeItemStoragePaths.has(path)
    ),
    pendingWardrobeItemIdsPastThreshold: params.wardrobeItems
      .filter((item) => item.uploadStatus === "upload_pending")
      .filter((item) => {
        const updatedAtMs = toTimeMs(item.updatedAtIso);

        return updatedAtMs !== null && nowMs - updatedAtMs > pendingAgeThresholdMs;
      })
      .map((item) => item.id),
    wardrobeItemIdsMissingStorageObjects: params.wardrobeItems
      .filter((item) => !wardrobeStorageObjectPaths.has(item.storagePath))
      .map((item) => item.id)
  };
}

export function expectedWardrobeOriginalPath(item: {
  id: string;
  userId: string;
}): string {
  return storagePaths.wardrobeOriginal(item.userId, item.id).path;
}
