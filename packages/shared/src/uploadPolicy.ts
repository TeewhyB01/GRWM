export const ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
] as const;

export const ALLOWED_STYLE_PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
] as const;

export const ALLOWED_AVATAR_SOURCE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
] as const;

export const BYTES_PER_MEBIBYTE = 1024 * 1024;

export const MAX_WARDROBE_IMAGE_BYTES = 10 * BYTES_PER_MEBIBYTE;
export const MAX_STYLE_PHOTO_IMAGE_BYTES = 10 * BYTES_PER_MEBIBYTE;
export const MAX_AVATAR_SOURCE_IMAGE_BYTES = 10 * BYTES_PER_MEBIBYTE;
export const MAX_AVATAR_GENERATED_IMAGE_BYTES = 15 * BYTES_PER_MEBIBYTE;
export const MAX_OUTFIT_IMAGE_BYTES = 10 * BYTES_PER_MEBIBYTE;

export const STORAGE_UPLOAD_CATEGORIES = [
  "wardrobe-original",
  "style-photo-original",
  "avatar-source-original",
  "avatar-generated",
  "outfit"
] as const;

export type WardrobeImageContentType = (typeof ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES)[number];
export type StylePhotoContentType = (typeof ALLOWED_STYLE_PHOTO_CONTENT_TYPES)[number];
export type AvatarSourceContentType = (typeof ALLOWED_AVATAR_SOURCE_CONTENT_TYPES)[number];
export type StorageUploadCategory = (typeof STORAGE_UPLOAD_CATEGORIES)[number];

export function isAllowedWardrobeImageContentType(value: string): value is WardrobeImageContentType {
  return ALLOWED_WARDROBE_IMAGE_CONTENT_TYPES.includes(value as WardrobeImageContentType);
}

export function isAllowedStylePhotoContentType(value: string): value is StylePhotoContentType {
  return ALLOWED_STYLE_PHOTO_CONTENT_TYPES.includes(value as StylePhotoContentType);
}

export function isAllowedAvatarSourceContentType(value: string): value is AvatarSourceContentType {
  return ALLOWED_AVATAR_SOURCE_CONTENT_TYPES.includes(value as AvatarSourceContentType);
}

export function isStorageUploadCategory(value: string): value is StorageUploadCategory {
  return STORAGE_UPLOAD_CATEGORIES.includes(value as StorageUploadCategory);
}
