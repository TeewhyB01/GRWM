export {
  deleteAuthUser
} from "./deleteAuthUser.ts";

export {
  deleteUserFirestoreData,
  getUserFirestoreDeletionPlan,
  retainedDeletionCollections
} from "./deleteUserFirestoreData.ts";

export {
  deleteUserStorageData,
  getUserStorageDeletionPrefixes
} from "./deleteUserStorageData.ts";

export {
  createDeletionAuditLogPayload,
  deletionAuditActions,
  writeDeletionAuditLog
} from "./deletionAudit.ts";

export {
  createCompletedDeletionTombstone,
  createFailureStatusUpdate,
  createProcessingStatusUpdate,
  normalizeUserDeletionRequest,
  processUserDeletionRequest,
  toSafeFailureReason,
  userDataDeletion
} from "./processUserDeletionRequest.ts";

export type {
  DeletionAuditAction,
  DeletionAuditLogPayload
} from "./deletionAudit.ts";

export type {
  AuthDeletionResult,
  AuthLike,
  DeletionProcessorDependencies,
  FirestoreDeletionResult,
  NormalizedUserDeletionRequest,
  ProcessUserDeletionRequestInput,
  ProcessUserDeletionRequestOutcome,
  StorageBucketLike,
  StorageDeletionResult,
  StorageFileLike
} from "./types.ts";
