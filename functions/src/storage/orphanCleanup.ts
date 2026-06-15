import { storagePaths } from "@grwm/shared";

export interface WardrobeStorageObjectReference {
  name: string;
}

export interface WardrobeItemStorageReference {
  id: string;
  userId: string;
  storagePath: string;
}

export interface WardrobeOrphanScanResult {
  orphanedStorageObjectPaths: readonly string[];
  wardrobeItemIdsMissingStorageObjects: readonly string[];
}

export const wardrobeOrphanCleanupPolicy = {
  destructiveCleanupEnabled: false,
  mustRunServerSide: true,
  reason:
    "Wardrobe orphan cleanup compares private Storage objects with Firestore records and must use trusted Admin SDK access, audit logging, and retry-safe deletes."
} as const;

export function wardrobeStoragePrefix(userId: string): string {
  return `users/${userId}/wardrobe/`;
}

export function isWardrobeOriginalStoragePath(path: string): boolean {
  const segments = path.split("/");
  const [root, userId, collection, itemId, leaf] = segments;

  return (
    segments.length === 5 &&
    root === "users" &&
    collection === "wardrobe" &&
    leaf === "original" &&
    Boolean(userId) &&
    Boolean(itemId)
  );
}

export function detectWardrobeStorageOrphans(params: {
  storageObjects: readonly WardrobeStorageObjectReference[];
  wardrobeItems: readonly WardrobeItemStorageReference[];
}): WardrobeOrphanScanResult {
  const wardrobeItemStoragePaths = new Set(params.wardrobeItems.map((item) => item.storagePath));
  const wardrobeStorageObjectPaths = new Set(
    params.storageObjects
      .map((object) => object.name)
      .filter((name) => isWardrobeOriginalStoragePath(name))
  );

  return {
    orphanedStorageObjectPaths: [...wardrobeStorageObjectPaths].filter(
      (path) => !wardrobeItemStoragePaths.has(path)
    ),
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
