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

function assertSafePathSegment(value: string, label: string): string {
  if (!value || value.includes("/") || value.includes("..")) {
    throw new Error(`Invalid ${label} storage path segment.`);
  }

  return value;
}

export const storagePaths = {
  wardrobeOriginal(userId: string, itemId: string): StoragePathDefinition {
    return {
      kind: "wardrobe-original",
      path: `users/${assertSafePathSegment(userId, "userId")}/wardrobe/${assertSafePathSegment(itemId, "itemId")}/original`,
      isPrivate: true
    };
  },
  stylePhotoOriginal(userId: string, photoId: string): StoragePathDefinition {
    return {
      kind: "style-photo-original",
      path: `users/${assertSafePathSegment(userId, "userId")}/style-photos/${assertSafePathSegment(photoId, "photoId")}/original`,
      isPrivate: true
    };
  },
  avatarSourceOriginal(userId: string, photoId: string): StoragePathDefinition {
    return {
      kind: "avatar-source-original",
      path: `users/${assertSafePathSegment(userId, "userId")}/avatar/source/${assertSafePathSegment(photoId, "photoId")}/original`,
      isPrivate: true
    };
  },
  avatarGenerated(userId: string, generationId: string): StoragePathDefinition {
    return {
      kind: "avatar-generated",
      path: `users/${assertSafePathSegment(userId, "userId")}/avatar/generated/${assertSafePathSegment(generationId, "generationId")}`,
      isPrivate: true
    };
  },
  outfit(userId: string, outfitId: string): StoragePathDefinition {
    return {
      kind: "outfit",
      path: `users/${assertSafePathSegment(userId, "userId")}/outfits/${assertSafePathSegment(outfitId, "outfitId")}`,
      isPrivate: true
    };
  }
} as const;
