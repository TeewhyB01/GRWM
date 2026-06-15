import type { WardrobeUploadMetadata } from "./types.ts";
import { storagePaths } from "./storagePaths.ts";
import { isSafeWardrobeLifecycleId, isValidWardrobeUploadMetadata } from "./validation.ts";
import type { WardrobeCategory } from "./types.ts";

export interface ParsedWardrobeUploadStoragePath {
  itemId: string;
  userId: string;
}

export function getWardrobeUploadStoragePath(params: {
  itemId: string;
  userId: string;
}): string {
  return storagePaths.wardrobeOriginal(params.userId, params.itemId).path;
}

export function buildWardrobeUploadMetadata(params: {
  category?: WardrobeCategory;
  consentVersion: string;
  itemId: string;
  ownerId?: string;
  userId: string;
}): WardrobeUploadMetadata {
  const ownerId = params.ownerId ?? params.userId;
  const metadata = {
    ownerId,
    userId: params.userId,
    itemId: params.itemId,
    category: params.category ?? "other",
    uploadCategory: "wardrobe-original",
    consentVersion: params.consentVersion,
    storagePath: getWardrobeUploadStoragePath({
      itemId: params.itemId,
      userId: params.userId
    })
  } as const satisfies WardrobeUploadMetadata;

  if (!validateWardrobeUploadMetadata(metadata)) {
    throw new Error("Invalid wardrobe upload metadata.");
  }

  return metadata;
}

export function parseWardrobeUploadStoragePath(
  storagePath: string
): ParsedWardrobeUploadStoragePath | null {
  const [root, userId, collection, itemId, leaf, extra] = storagePath.split("/");

  if (
    root !== "users" ||
    collection !== "wardrobe" ||
    leaf !== "original" ||
    extra !== undefined ||
    typeof userId !== "string" ||
    typeof itemId !== "string" ||
    !isSafeWardrobeLifecycleId(userId) ||
    !isSafeWardrobeLifecycleId(itemId)
  ) {
    return null;
  }

  if (getWardrobeUploadStoragePath({ itemId, userId }) !== storagePath) {
    return null;
  }

  return { itemId, userId };
}

export function validateWardrobeUploadMetadata(
  metadata: WardrobeUploadMetadata,
  expected?: {
    itemId?: string;
    category?: WardrobeCategory;
    storagePath?: string;
    userId?: string;
  }
): boolean {
  if (!isValidWardrobeUploadMetadata(metadata)) {
    return false;
  }

  if (expected?.itemId !== undefined && metadata.itemId !== expected.itemId) {
    return false;
  }

  if (expected?.userId !== undefined && metadata.userId !== expected.userId) {
    return false;
  }

  if (expected?.category !== undefined && metadata.category !== expected.category) {
    return false;
  }

  if (expected?.storagePath !== undefined && metadata.storagePath !== expected.storagePath) {
    return false;
  }

  return true;
}
