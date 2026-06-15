import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { parseWardrobeUploadStoragePath } from "@grwm/shared";

import { getFunctionsRuntimeConfig } from "../config.ts";
import { DEFAULT_FUNCTION_REGION } from "../placeholders/registry.ts";
import { finaliseWardrobeUpload } from "./finaliseWardrobeUpload.ts";
import {
  type WardrobeUploadFinalisationDependencies,
  type WardrobeUploadFirestoreLike
} from "./markWardrobeUploadFailed.ts";

function getAdminApp() {
  return getApps()[0] ?? initializeApp();
}

export function createDefaultWardrobeUploadFinalisationDependencies(): WardrobeUploadFinalisationDependencies {
  const app = getAdminApp();

  return {
    db: getFirestore(app) as unknown as WardrobeUploadFirestoreLike,
    logger: console,
    nowIso: () => new Date().toISOString()
  };
}

export const wardrobeUploadTriggerBucket =
  getFunctionsRuntimeConfig().storageBucket || "demo-grwm.appspot.com";

export const wardrobeUploadFinalisation = onObjectFinalized(
  {
    bucket: wardrobeUploadTriggerBucket,
    region: DEFAULT_FUNCTION_REGION
  },
  async (event) => {
    if (!event.data.name || !parseWardrobeUploadStoragePath(event.data.name)) {
      return;
    }

    await finaliseWardrobeUpload({
      deps: createDefaultWardrobeUploadFinalisationDependencies(),
      storageObject: {
        contentType: event.data.contentType,
        metadata: event.data.metadata,
        name: event.data.name,
        size: event.data.size
      }
    });
  }
);

export {
  finaliseWardrobeUpload
} from "./finaliseWardrobeUpload.ts";

export {
  markWardrobeUploadFailed,
  wardrobeUploadAuditActions,
  writeWardrobeUploadAuditLog
} from "./markWardrobeUploadFailed.ts";

export {
  evaluateWardrobeAnalysisRequest
} from "./requestWardrobeAnalysis.ts";

export {
  verifyWardrobeStorageObject
} from "./verifyWardrobeStorageObject.ts";

export type {
  WardrobeAnalysisRequestDecision
} from "./requestWardrobeAnalysis.ts";

export type {
  FirestoreCollectionReferenceLike,
  FirestoreDocumentReferenceLike,
  FirestoreDocumentSnapshotLike,
  WardrobeUploadAuditAction,
  WardrobeUploadFinalisationDependencies,
  WardrobeUploadFirestoreLike
} from "./markWardrobeUploadFailed.ts";

export type {
  VerifiedWardrobeStorageObject,
  WardrobeStorageObjectSnapshot,
  WardrobeStorageObjectVerification
} from "./verifyWardrobeStorageObject.ts";
