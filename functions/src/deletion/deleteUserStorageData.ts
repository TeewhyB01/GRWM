import {
  assertSafeUserId,
  type StorageBucketLike,
  type StorageDeletionResult
} from "./types.ts";

export function getUserStorageDeletionPrefixes(userId: string): readonly string[] {
  const safeUserId = assertSafeUserId(userId);

  return [
    `users/${safeUserId}/wardrobe/`,
    `users/${safeUserId}/style-photos/`,
    `users/${safeUserId}/avatar/source/`,
    `users/${safeUserId}/avatar/generated/`,
    `users/${safeUserId}/outfits/`
  ];
}

export async function deleteUserStorageData(
  bucket: StorageBucketLike,
  userId: string
): Promise<StorageDeletionResult> {
  const prefixes = getUserStorageDeletionPrefixes(userId);
  let deletedFileCount = 0;

  for (const prefix of prefixes) {
    const [files] = await bucket.getFiles({ prefix });

    await Promise.all(
      files.map(async (file) => {
        await file.delete({ ignoreNotFound: true });
      })
    );
    deletedFileCount += files.length;
  }

  return {
    deletedFileCount,
    prefixes
  };
}
