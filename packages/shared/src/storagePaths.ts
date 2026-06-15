export type StoragePathKind =
  | "wardrobe-original"
  | "style-photo-original"
  | "avatar-source-original"
  | "avatar-generated"
  | "outfit";

export interface StoragePathDefinition {
  kind: StoragePathKind;
  path: string;
  isPrivate: true;
}

export function isSafeStoragePathSegment(value: string): boolean {
  return (
    value.length > 0 &&
    value.trim() === value &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\") &&
    !value.includes("..")
  );
}

export function assertSafeStoragePathSegment(value: string, label: string): string {
  if (!isSafeStoragePathSegment(value)) {
    throw new Error(`Invalid ${label} storage path segment.`);
  }

  return value;
}

export const storagePaths = {
  wardrobeOriginal(userId: string, itemId: string): StoragePathDefinition {
    return {
      kind: "wardrobe-original",
      path: `users/${assertSafeStoragePathSegment(userId, "userId")}/wardrobe/${assertSafeStoragePathSegment(itemId, "itemId")}/original`,
      isPrivate: true
    };
  },
  stylePhotoOriginal(userId: string, photoId: string): StoragePathDefinition {
    return {
      kind: "style-photo-original",
      path: `users/${assertSafeStoragePathSegment(userId, "userId")}/style-photos/${assertSafeStoragePathSegment(photoId, "photoId")}/original`,
      isPrivate: true
    };
  },
  avatarSourceOriginal(userId: string, photoId: string): StoragePathDefinition {
    return {
      kind: "avatar-source-original",
      path: `users/${assertSafeStoragePathSegment(userId, "userId")}/avatar/source/${assertSafeStoragePathSegment(photoId, "photoId")}/original`,
      isPrivate: true
    };
  },
  avatarGenerated(userId: string, generationId: string): StoragePathDefinition {
    return {
      kind: "avatar-generated",
      path: `users/${assertSafeStoragePathSegment(userId, "userId")}/avatar/generated/${assertSafeStoragePathSegment(generationId, "generationId")}`,
      isPrivate: true
    };
  },
  outfit(userId: string, outfitId: string): StoragePathDefinition {
    return {
      kind: "outfit",
      path: `users/${assertSafeStoragePathSegment(userId, "userId")}/outfits/${assertSafeStoragePathSegment(outfitId, "outfitId")}`,
      isPrivate: true
    };
  }
} as const;
