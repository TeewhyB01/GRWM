import {
  firestoreCollections,
  type AdminAuditLog,
  type UserDeletionRequestStatus
} from "@grwm/shared";
import type { Firestore } from "firebase-admin/firestore";

import { DELETION_PROCESSOR_ACTOR_ID } from "./types.ts";

export const deletionAuditActions = {
  requested: "user-deletion.requested",
  processingStarted: "user-deletion.processing-started",
  firestoreCompleted: "user-deletion.firestore-completed",
  storageCompleted: "user-deletion.storage-completed",
  authCompleted: "user-deletion.auth-completed",
  completed: "user-deletion.completed",
  failed: "user-deletion.failed"
} as const;

export type DeletionAuditAction = (typeof deletionAuditActions)[keyof typeof deletionAuditActions];

export interface DeletionAuditLogPayload extends AdminAuditLog {
  actorType: "system";
  requestStatus: UserDeletionRequestStatus;
  source: "function";
  targetUserId: string;
  metadata: {
    authUserDeleted?: boolean;
    deletedFirestoreDocumentCount?: number;
    deletedStorageFileCount?: number;
    failureReason?: string;
  };
}

export function createDeletionAuditLogPayload(params: {
  action: DeletionAuditAction;
  createdAtIso: string;
  id: string;
  metadata?: DeletionAuditLogPayload["metadata"];
  requestStatus: UserDeletionRequestStatus;
  userId: string;
}): DeletionAuditLogPayload {
  return {
    id: params.id,
    adminUserId: DELETION_PROCESSOR_ACTOR_ID,
    action: params.action,
    targetCollection: firestoreCollections.userDeletionRequests,
    targetId: params.userId,
    createdAtIso: params.createdAtIso,
    actorType: "system",
    requestStatus: params.requestStatus,
    source: "function",
    targetUserId: params.userId,
    metadata: params.metadata ?? {}
  };
}

export async function writeDeletionAuditLog(
  db: Firestore,
  params: Omit<Parameters<typeof createDeletionAuditLogPayload>[0], "id">
): Promise<string> {
  const auditLogReference = db.collection(firestoreCollections.adminAuditLogs).doc();
  const auditLog = createDeletionAuditLogPayload({
    ...params,
    id: auditLogReference.id
  });

  await auditLogReference.set(auditLog);

  return auditLogReference.id;
}
