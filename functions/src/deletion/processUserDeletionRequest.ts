import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import type { UserDeletionRequest } from "@grwm/shared";
import {
  PRIVACY_CONSENT_VERSION,
  firestoreCollections,
  type UserDeletionRequestRequestedBy,
  type UserDeletionRequestSource,
  type UserDeletionRequestStatus
} from "@grwm/shared";

import { getFunctionsRuntimeConfig } from "../config.ts";
import { DEFAULT_FUNCTION_REGION } from "../placeholders/registry.ts";
import { deleteAuthUser } from "./deleteAuthUser.ts";
import { deleteUserFirestoreData } from "./deleteUserFirestoreData.ts";
import { deleteUserStorageData } from "./deleteUserStorageData.ts";
import {
  deletionAuditActions,
  writeDeletionAuditLog
} from "./deletionAudit.ts";
import {
  assertSafeUserId,
  type DeletionProcessorDependencies,
  type NormalizedUserDeletionRequest,
  type ProcessUserDeletionRequestInput,
  type ProcessUserDeletionRequestOutcome,
  type StorageBucketLike
} from "./types.ts";

const requestUserMismatchFailureReason = "Deletion request user mismatch.";
const invalidRequestFailureReason = "Deletion request payload is invalid.";
const deletionProcessorFailureReason = "Deletion processor failed before completion.";

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readRequestedBy(value: unknown): UserDeletionRequestRequestedBy {
  return value === "admin" ? "admin" : "user";
}

function readSource(value: unknown): UserDeletionRequestSource {
  return value === "admin" || value === "function" || value === "mobile" ? value : "mobile";
}

function readStatus(value: unknown): UserDeletionRequestStatus {
  if (
    value === "requested" ||
    value === "processing" ||
    value === "completed" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "failed";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

export function normalizeUserDeletionRequest(
  requestId: string,
  requestData: unknown
): NormalizedUserDeletionRequest {
  const data = asRecord(requestData);

  return {
    id: readString(data.id, requestId),
    userId: readString(data.userId),
    requestedAtIso: readString(data.requestedAtIso),
    status: readStatus(data.status),
    processingStartedAtIso: readString(data.processingStartedAtIso),
    completedAtIso: readString(data.completedAtIso),
    failedAtIso: readString(data.failedAtIso),
    failureReason: readString(data.failureReason),
    requestedBy: readRequestedBy(data.requestedBy),
    source: readSource(data.source),
    consentVersionAtRequest: readString(data.consentVersionAtRequest, PRIVACY_CONSENT_VERSION),
    auditLogId: readString(data.auditLogId)
  };
}

export function createProcessingStatusUpdate(params: {
  auditLogId: string;
  nowIso: string;
}): Partial<UserDeletionRequest> {
  return {
    status: "processing",
    processingStartedAtIso: params.nowIso,
    failedAtIso: "",
    failureReason: "",
    auditLogId: params.auditLogId
  };
}

export function createCompletedDeletionTombstone(params: {
  auditLogId: string;
  completedAtIso: string;
  request: NormalizedUserDeletionRequest;
}): UserDeletionRequest {
  return {
    id: params.request.userId,
    userId: params.request.userId,
    requestedAtIso: params.request.requestedAtIso,
    status: "completed",
    processingStartedAtIso: params.request.processingStartedAtIso,
    completedAtIso: params.completedAtIso,
    failedAtIso: "",
    failureReason: "",
    requestedBy: params.request.requestedBy,
    source: params.request.source,
    consentVersionAtRequest: params.request.consentVersionAtRequest,
    auditLogId: params.auditLogId
  };
}

export function createFailureStatusUpdate(params: {
  auditLogId: string;
  failureReason: string;
  nowIso: string;
}): Partial<UserDeletionRequest> {
  return {
    status: "failed",
    failedAtIso: params.nowIso,
    failureReason: params.failureReason,
    auditLogId: params.auditLogId
  };
}

export function toSafeFailureReason(error: unknown): string {
  if (!(error instanceof Error)) {
    return deletionProcessorFailureReason;
  }

  if (
    error.message === requestUserMismatchFailureReason ||
    error.message === invalidRequestFailureReason
  ) {
    return error.message;
  }

  return deletionProcessorFailureReason;
}

function verifyDeletionRequestOwnership(
  requestId: string,
  request: NormalizedUserDeletionRequest
): void {
  assertSafeUserId(requestId);

  if (!request.userId || !request.id || !request.requestedAtIso) {
    throw new Error(invalidRequestFailureReason);
  }

  if (request.id !== requestId || request.userId !== requestId) {
    throw new Error(requestUserMismatchFailureReason);
  }
}

function requestDocumentPath(userId: string): string {
  return `${firestoreCollections.userDeletionRequests}/${userId}`;
}

async function updateDeletionRequest(
  deps: DeletionProcessorDependencies,
  userId: string,
  update: Partial<UserDeletionRequest>
): Promise<void> {
  await deps.db.doc(requestDocumentPath(userId)).set(update, { merge: true });
}

export async function processUserDeletionRequest({
  deps,
  requestData,
  requestId
}: ProcessUserDeletionRequestInput): Promise<ProcessUserDeletionRequestOutcome> {
  const request = normalizeUserDeletionRequest(requestId, requestData);
  let auditLogId = request.auditLogId;
  let auditUserId = requestId;

  try {
    verifyDeletionRequestOwnership(requestId, request);
    auditUserId = request.userId;

    if (request.status !== "requested") {
      return {
        ok: true,
        status: "skipped",
        auditLogId,
        userId: auditUserId
      };
    }

    auditLogId = await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.requested,
      createdAtIso: deps.nowIso(),
      requestStatus: "requested",
      userId: request.userId
    });

    const processingStartedAtIso = deps.nowIso();
    await updateDeletionRequest(
      deps,
      request.userId,
      createProcessingStatusUpdate({
        auditLogId,
        nowIso: processingStartedAtIso
      })
    );
    request.processingStartedAtIso = processingStartedAtIso;

    await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.processingStarted,
      createdAtIso: processingStartedAtIso,
      requestStatus: "processing",
      userId: request.userId
    });

    const firestoreDeletionResult = await deleteUserFirestoreData(deps.db, request.userId);
    await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.firestoreCompleted,
      createdAtIso: deps.nowIso(),
      metadata: {
        deletedFirestoreDocumentCount: firestoreDeletionResult.deletedDocumentCount
      },
      requestStatus: "processing",
      userId: request.userId
    });

    const storageDeletionResult = await deleteUserStorageData(deps.bucket, request.userId);
    await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.storageCompleted,
      createdAtIso: deps.nowIso(),
      metadata: {
        deletedStorageFileCount: storageDeletionResult.deletedFileCount
      },
      requestStatus: "processing",
      userId: request.userId
    });

    const authDeletionResult = await deleteAuthUser(deps.auth, request.userId);
    await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.authCompleted,
      createdAtIso: deps.nowIso(),
      metadata: {
        authUserDeleted: authDeletionResult.deleted
      },
      requestStatus: "processing",
      userId: request.userId
    });

    const completedAtIso = deps.nowIso();
    await updateDeletionRequest(
      deps,
      request.userId,
      createCompletedDeletionTombstone({
        auditLogId,
        completedAtIso,
        request
      })
    );

    await writeDeletionAuditLog(deps.db, {
      action: deletionAuditActions.completed,
      createdAtIso: completedAtIso,
      requestStatus: "completed",
      userId: request.userId
    });

    return {
      ok: true,
      status: "completed",
      auditLogId,
      userId: request.userId
    };
  } catch (error) {
    const failureReason = toSafeFailureReason(error);
    const failedAtIso = deps.nowIso();

    deps.logger.error("Deletion processor failed with a safe user-facing reason.", {
      failureReason,
      requestId
    });

    try {
      auditLogId = await writeDeletionAuditLog(deps.db, {
        action: deletionAuditActions.failed,
        createdAtIso: failedAtIso,
        metadata: {
          failureReason
        },
        requestStatus: "failed",
        userId: auditUserId
      });

      await updateDeletionRequest(
        deps,
        requestId,
        createFailureStatusUpdate({
          auditLogId,
          failureReason,
          nowIso: failedAtIso
        })
      );
    } catch (failureUpdateError) {
      deps.logger.error("Deletion processor could not write failed status.", {
        requestId,
        safeFailureReason: failureReason,
        statusWriteFailed: failureUpdateError instanceof Error
      });
    }

    return {
      ok: false,
      status: "failed",
      auditLogId,
      failureReason,
      userId: auditUserId
    };
  }
}

function getAdminApp() {
  return getApps()[0] ?? initializeApp();
}

function createDefaultDeletionProcessorDependencies(): DeletionProcessorDependencies {
  const app = getAdminApp();
  const runtimeConfig = getFunctionsRuntimeConfig();
  const storage = getStorage(app);
  const bucket = runtimeConfig.storageBucket
    ? storage.bucket(runtimeConfig.storageBucket)
    : storage.bucket();

  return {
    auth: getAuth(app),
    bucket: bucket as unknown as StorageBucketLike,
    db: getFirestore(app),
    logger: console,
    nowIso: () => new Date().toISOString()
  };
}

export const userDataDeletion = onDocumentCreated(
  {
    document: `${firestoreCollections.userDeletionRequests}/{userId}`,
    region: DEFAULT_FUNCTION_REGION
  },
  async (event) => {
    if (!event.data) {
      return;
    }

    await processUserDeletionRequest({
      deps: createDefaultDeletionProcessorDependencies(),
      requestData: event.data.data(),
      requestId: event.params.userId
    });
  }
);
