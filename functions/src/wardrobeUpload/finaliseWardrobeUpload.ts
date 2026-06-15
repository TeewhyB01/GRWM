import {
  firestoreCollections,
  isWardrobeAnalysisStatus,
  type WardrobeAnalysisStatus,
  type WardrobeUploadFinalisationResult
} from "@grwm/shared";

import {
  markWardrobeUploadFailed,
  wardrobeUploadAuditActions,
  writeWardrobeUploadAuditLog,
  type WardrobeUploadFinalisationDependencies
} from "./markWardrobeUploadFailed.ts";
import {
  verifyWardrobeStorageObject,
  type WardrobeStorageObjectSnapshot
} from "./verifyWardrobeStorageObject.ts";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function readAnalysisStatus(value: unknown): WardrobeAnalysisStatus {
  return typeof value === "string" && isWardrobeAnalysisStatus(value)
    ? value
    : "not_requested";
}

async function readWardrobeItem(
  deps: WardrobeUploadFinalisationDependencies,
  itemId: string
): Promise<Record<string, unknown> | null> {
  const documentReference = deps.db.collection(firestoreCollections.wardrobeItems).doc(itemId);
  const snapshot = await documentReference.get?.();

  if (!snapshot?.exists) {
    return null;
  }

  return asRecord(snapshot.data());
}

export async function finaliseWardrobeUpload(params: {
  deps: WardrobeUploadFinalisationDependencies;
  storageObject: WardrobeStorageObjectSnapshot;
}): Promise<WardrobeUploadFinalisationResult> {
  const verification = verifyWardrobeStorageObject(params.storageObject);

  if (!verification.ok) {
    return markWardrobeUploadFailed(params.deps, {
      failureReason: verification.failureReason,
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  const wardrobeItem = await readWardrobeItem(params.deps, verification.itemId);
  const analysisStatus = readAnalysisStatus(wardrobeItem?.analysisStatus);

  if (!wardrobeItem) {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "missing_wardrobe_item",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  if (
    wardrobeItem.userId !== verification.userId ||
    wardrobeItem.ownerId !== verification.userId
  ) {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "user_mismatch",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  if (wardrobeItem.id !== verification.itemId || wardrobeItem.itemId !== verification.itemId) {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "metadata_mismatch",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  if (wardrobeItem.category !== verification.metadata.category) {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "metadata_mismatch",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  if (wardrobeItem.storagePath !== verification.storagePath) {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "storage_path_mismatch",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  if (wardrobeItem.uploadStatus === "uploaded") {
    params.deps.logger.info("Wardrobe upload finalisation skipped for already uploaded item.", {
      itemId: verification.itemId,
      userId: verification.userId
    });

    return {
      ok: true,
      userId: verification.userId,
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      uploadStatus: "uploaded",
      failureReason: "",
      analysisStatus,
      auditLogId: ""
    };
  }

  if (wardrobeItem.uploadStatus === "deleted") {
    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "already_deleted",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }

  const uploadedAtIso = params.deps.nowIso();

  try {
    await params.deps
      .db
      .collection(firestoreCollections.wardrobeItems)
      .doc(verification.itemId)
      .set({
        uploadStatus: "uploaded",
        uploadedAtIso,
        uploadFailedAtIso: "",
        uploadFailureReason: "",
        updatedAtIso: uploadedAtIso
      }, { merge: true });

    const auditLogId = await writeWardrobeUploadAuditLog(params.deps, {
      action: wardrobeUploadAuditActions.finalised,
      itemId: verification.itemId,
      status: "uploaded",
      userId: verification.userId
    });

    params.deps.logger.info("Wardrobe upload finalised.", {
      itemId: verification.itemId,
      userId: verification.userId
    });

    return {
      ok: true,
      userId: verification.userId,
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      uploadStatus: "uploaded",
      failureReason: "",
      analysisStatus,
      auditLogId
    };
  } catch (error) {
    params.deps.logger.error("Wardrobe upload finalisation write failed.", {
      itemId: verification.itemId,
      userId: verification.userId,
      writeFailed: error instanceof Error
    });

    return markWardrobeUploadFailed(params.deps, {
      analysisStatus,
      failureReason: "write_failed",
      itemId: verification.itemId,
      storagePath: verification.storagePath,
      userId: verification.userId
    });
  }
}
