import {
  firestoreCollections,
  getWardrobeUploadFailurePayload,
  type WardrobeAnalysisStatus,
  type WardrobeUploadFailureReason,
  type WardrobeUploadFinalisationResult
} from "@grwm/shared";

export interface FirestoreDocumentSnapshotLike {
  data(): unknown;
  exists: boolean;
}

export interface FirestoreDocumentReferenceLike {
  get?(): Promise<FirestoreDocumentSnapshotLike>;
  id: string;
  set(data: unknown, options?: { merge: boolean }): Promise<void>;
}

export interface FirestoreCollectionReferenceLike {
  doc(id?: string): FirestoreDocumentReferenceLike;
}

export interface WardrobeUploadFirestoreLike {
  collection(collectionName: string): FirestoreCollectionReferenceLike;
}

export interface WardrobeUploadFinalisationDependencies {
  db: WardrobeUploadFirestoreLike;
  logger: Pick<Console, "error" | "info">;
  nowIso(): string;
}

export const wardrobeUploadAuditActions = {
  failed: "wardrobe-upload.failed",
  finalised: "wardrobe-upload.finalised"
} as const;

export type WardrobeUploadAuditAction =
  (typeof wardrobeUploadAuditActions)[keyof typeof wardrobeUploadAuditActions];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function existingWardrobeItemBelongsToUser(
  snapshot: FirestoreDocumentSnapshotLike,
  userId: string
): boolean {
  const data = asRecord(snapshot.data());

  return data.userId === userId && data.ownerId === userId;
}

export async function writeWardrobeUploadAuditLog(
  deps: WardrobeUploadFinalisationDependencies,
  params: {
    action: WardrobeUploadAuditAction;
    failureReason?: WardrobeUploadFailureReason;
    itemId: string;
    status: "uploaded" | "upload_failed";
    userId: string;
  }
): Promise<string> {
  const auditLogReference = deps.db.collection(firestoreCollections.adminAuditLogs).doc();
  const auditLog = {
    id: auditLogReference.id,
    adminUserId: "system:wardrobe-upload-finaliser",
    action: params.action,
    targetCollection: firestoreCollections.wardrobeItems,
    targetId: params.itemId || "unknown",
    createdAtIso: deps.nowIso(),
    actorType: "system",
    source: "function",
    targetUserId: params.userId || "unknown",
    metadata: {
      failureReason: params.failureReason ?? "",
      uploadStatus: params.status
    }
  };

  await auditLogReference.set(auditLog);

  return auditLogReference.id;
}

export async function markWardrobeUploadFailed(
  deps: WardrobeUploadFinalisationDependencies,
  params: {
    analysisStatus?: WardrobeAnalysisStatus;
    failureReason: WardrobeUploadFailureReason;
    itemId: string;
    storagePath: string;
    userId: string;
  }
): Promise<WardrobeUploadFinalisationResult> {
  const nowIso = deps.nowIso();
  let auditLogId = "";

  try {
    if (params.itemId) {
      const documentReference = deps.db
        .collection(firestoreCollections.wardrobeItems)
        .doc(params.itemId);
      const snapshot = await documentReference.get?.();

      if (
        snapshot === undefined ||
        (snapshot.exists && existingWardrobeItemBelongsToUser(snapshot, params.userId))
      ) {
        await documentReference.set(getWardrobeUploadFailurePayload({
          nowIso,
          reason: params.failureReason
        }), { merge: true });
      }
    }

    auditLogId = await writeWardrobeUploadAuditLog(deps, {
      action: wardrobeUploadAuditActions.failed,
      failureReason: params.failureReason,
      itemId: params.itemId,
      status: "upload_failed",
      userId: params.userId
    });
  } catch (error) {
    deps.logger.error("Wardrobe upload failed and could not be fully marked failed.", {
      failureReason: params.failureReason,
      itemId: params.itemId,
      writeFailed: error instanceof Error
    });

    return {
      ok: false,
      userId: params.userId,
      itemId: params.itemId,
      storagePath: params.storagePath,
      uploadStatus: "upload_failed",
      failureReason: "write_failed",
      analysisStatus: params.analysisStatus ?? "not_requested",
      auditLogId
    };
  }

  return {
    ok: false,
    userId: params.userId,
    itemId: params.itemId,
    storagePath: params.storagePath,
    uploadStatus: "upload_failed",
    failureReason: params.failureReason,
    analysisStatus: params.analysisStatus ?? "not_requested",
    auditLogId
  };
}
