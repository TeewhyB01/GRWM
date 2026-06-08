import test, { after, before, beforeEach } from "node:test";

import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment
} from "@firebase/rules-unit-testing";

import { storagePathBuilders } from "./helpers/paths.ts";
import { testDocumentIds, testUserIds } from "./helpers/ids.ts";
import {
  authenticatedTestContext,
  cleanupRulesTestEnvironment,
  clearStorageEmulator,
  initializeRulesTestEnvironment,
  seedStorageObject,
  testImageBytes,
  testImageMetadata,
  unauthenticatedTestContext
} from "./helpers/testEnvironment.ts";

let testEnv: RulesTestEnvironment;

function storageFor(userId: string) {
  return authenticatedTestContext(testEnv, userId).storage();
}

function putStorageObject(userId: string, path: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    storageFor(userId).ref(path).put(testImageBytes, testImageMetadata).then(resolve, reject);
  });
}

function putUnauthenticatedStorageObject(path: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    unauthenticatedTestContext(testEnv).storage().ref(path).put(testImageBytes, testImageMetadata).then(resolve, reject);
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

  await assertSucceeds(putStorageObject(testUserIds.userA, path));
});

test("user cannot write under another user's Storage path", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userB, testDocumentIds.wardrobeItemB);

  await assertFails(putStorageObject(testUserIds.userA, path));
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

  await assertSucceeds(putStorageObject(testUserIds.userA, path));
});

test("user can write under users/{userId}/avatar/source/{photoId}/original", async () => {
  const path = storagePathBuilders.avatarSourceOriginal(testUserIds.userA, testDocumentIds.avatarSourcePhotoA);

  await assertSucceeds(putStorageObject(testUserIds.userA, path));
});

test("user can read their own generated avatar output", async () => {
  const path = storagePathBuilders.avatarGenerated(testUserIds.userA, testDocumentIds.avatarGenerationA);

  await seedStorageObject(testEnv, path);

  await assertSucceeds(storageFor(testUserIds.userA).ref(path).getMetadata());
});

test("unauthenticated user cannot access private Storage files", async () => {
  const path = storagePathBuilders.wardrobeOriginal(testUserIds.userA, testDocumentIds.wardrobeItemA);
  const storage = unauthenticatedTestContext(testEnv).storage();

  await seedStorageObject(testEnv, path);

  await assertFails(storage.ref(path).getMetadata());
  await assertFails(putUnauthenticatedStorageObject(path));
});
