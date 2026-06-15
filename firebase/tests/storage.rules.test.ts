import test, { after, before, beforeEach } from "node:test";

import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import {
  MAX_WARDROBE_IMAGE_BYTES,
  PRIVACY_CONSENT_VERSION
} from "@grwm/shared";

import { storagePathBuilders } from "./helpers/paths.ts";
import { testDocumentIds, testUserIds } from "./helpers/ids.ts";
import {
  authenticatedTestContext,
  cleanupRulesTestEnvironment,
  clearStorageEmulator,
  initializeRulesTestEnvironment,
  seedStorageObject,
  testImageBytes,
  unauthenticatedTestContext
} from "./helpers/testEnvironment.ts";

let testEnv: RulesTestEnvironment;

function storageFor(userId: string) {
  return authenticatedTestContext(testEnv, userId).storage();
}

type StorageTestMetadata = {
  contentType: string;
  customMetadata: Record<string, string>;
};

function wardrobeUploadMetadata(
  userId: string,
  itemId: string,
  overrides: Partial<StorageTestMetadata["customMetadata"]> = {},
  contentType = "image/jpeg"
): StorageTestMetadata {
  return {
    contentType,
    customMetadata: {
      ownerId: userId,
      userId,
      itemId,
      uploadCategory: "wardrobe-original",
      consentVersion: PRIVACY_CONSENT_VERSION,
      ...overrides
    }
  };
}

function stylePhotoUploadMetadata(userId: string, photoId: string): StorageTestMetadata {
  return {
    contentType: "image/png",
    customMetadata: {
      ownerId: userId,
      userId,
      photoId,
      uploadCategory: "style-photo-original",
      consentVersion: PRIVACY_CONSENT_VERSION
    }
  };
}

function avatarSourceUploadMetadata(userId: string, photoId: string): StorageTestMetadata {
  return {
    contentType: "image/webp",
    customMetadata: {
      ownerId: userId,
      userId,
      photoId,
      uploadCategory: "avatar-source-original",
      consentVersion: PRIVACY_CONSENT_VERSION
    }
  };
}

function avatarGeneratedUploadMetadata(userId: string, generationId: string): StorageTestMetadata {
  return {
    contentType: "image/png",
    customMetadata: {
      ownerId: userId,
      userId,
      generationId,
      uploadCategory: "avatar-generated",
      consentVersion: PRIVACY_CONSENT_VERSION
    }
  };
}

function putStorageObject(
  userId: string,
  path: string,
  metadata: StorageTestMetadata,
  bytes = testImageBytes
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    storageFor(userId).ref(path).put(bytes, metadata).then(resolve, reject);
  });
}

function putUnauthenticatedStorageObject(
  path: string,
  metadata: StorageTestMetadata
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    unauthenticatedTestContext(testEnv).storage().ref(path).put(testImageBytes, metadata).then(resolve, reject);
  });
}

before(async () => {
  testEnv = await initializeRulesTestEnvironment(["storage"]);
});

beforeEach(async () => {
  await clearStorageEmulator(testEnv);
});

after(async () => {
  await cleanupRulesTestEnvironment(testEnv);
});

test("authenticated user can write under users/{userId}/wardrobe/{itemId}/original", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await assertSucceeds(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA)
    )
  );
});

test("invalid wardrobe image content type is denied", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA, {}, "application/pdf")
    )
  );
});

test("oversized wardrobe image upload is denied", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);
  const oversizedBytes = new Uint8Array(MAX_WARDROBE_IMAGE_BYTES + 1);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA),
      oversizedBytes
    )
  );
});

test("user cannot write under another user's Storage path", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userB, testDocumentIds.wardrobeItemB);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userB, testDocumentIds.wardrobeItemB)
    )
  );
});

test("wardrobe image upload with owner metadata mismatch is denied", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA, {
        ownerId: testUserIds.userB
      })
    )
  );
});

test("wardrobe image upload with item metadata mismatch is denied", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA, {
        itemId: testDocumentIds.wardrobeItemB
      })
    )
  );
});

test("wardrobe image upload without consent metadata is denied", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA, {
        consentVersion: ""
      })
    )
  );
});

test("user can read their own wardrobe image", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await seedStorageObject(testEnv, path);

  await assertSucceeds(storageFor(testUserIds.userA).ref(path).getMetadata());
});

test("user cannot read another user's wardrobe image", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userB, testDocumentIds.wardrobeItemB);

  await seedStorageObject(testEnv, path);

  await assertFails(storageFor(testUserIds.userA).ref(path).getMetadata());
});

test("user can write under users/{userId}/style-photos/{photoId}/original", async () => {
  const path = storagePathBuilders.stylePhotoOriginal(testUserIds.userA, testDocumentIds.stylePhotoA);

  await assertSucceeds(
    putStorageObject(
      testUserIds.userA,
      path,
      stylePhotoUploadMetadata(testUserIds.userA, testDocumentIds.stylePhotoA)
    )
  );
});

test("user can write under users/{userId}/avatar/source/{photoId}/original", async () => {
  const path = storagePathBuilders.avatarSourceOriginal(testUserIds.userA, testDocumentIds.avatarSourcePhotoA);

  await assertSucceeds(
    putStorageObject(
      testUserIds.userA,
      path,
      avatarSourceUploadMetadata(testUserIds.userA, testDocumentIds.avatarSourcePhotoA)
    )
  );
});

test("user can read their own generated avatar output", async () => {
  const path = storagePathBuilders.avatarGenerated(testUserIds.userA, testDocumentIds.avatarGenerationA);

  await seedStorageObject(testEnv, path);

  await assertSucceeds(storageFor(testUserIds.userA).ref(path).getMetadata());
});

test("generated avatar output cannot be client-written", async () => {
  const path = storagePathBuilders.avatarGenerated(testUserIds.userA, testDocumentIds.avatarGenerationA);

  await assertFails(
    putStorageObject(
      testUserIds.userA,
      path,
      avatarGeneratedUploadMetadata(testUserIds.userA, testDocumentIds.avatarGenerationA)
    )
  );
});

test("unauthenticated user cannot access private Storage files", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);
  const storage = unauthenticatedTestContext(testEnv).storage();

  await seedStorageObject(testEnv, path);

  await assertFails(storage.ref(path).getMetadata());
  await assertFails(
    putUnauthenticatedStorageObject(
      path,
      wardrobeUploadMetadata(testUserIds.userA, testDocumentIds.wardrobeItemA)
    )
  );
});

test("broad Storage list operations are denied", async () => {
  await assertFails(storageFor(testUserIds.userA).ref(`users/${testUserIds.userA}`).listAll());
  await assertFails(unauthenticatedTestContext(testEnv).storage().ref("users").listAll());
});

test("user can delete their own wardrobe image", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);

  await seedStorageObject(testEnv, path);

  await assertSucceeds(storageFor(testUserIds.userA).ref(path).delete());
});

test("user cannot delete another user's wardrobe image", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userB, testDocumentIds.wardrobeItemB);

  await seedStorageObject(testEnv, path);

  await assertFails(storageFor(testUserIds.userA).ref(path).delete());
});

test("generated avatar output cannot be client-deleted", async () => {
  const path = storagePathBuilders.avatarGenerated(testUserIds.userA, testDocumentIds.avatarGenerationA);

  await seedStorageObject(testEnv, path);

  await assertFails(storageFor(testUserIds.userA).ref(path).delete());
});
