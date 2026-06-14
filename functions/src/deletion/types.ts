import type {
  UserDeletionRequest,
  UserDeletionRequestStatus
} from "@grwm/shared";
import type { Firestore } from "firebase-admin/firestore";

export const DELETION_PROCESSOR_ACTOR_ID = "system:deletion-processor";

export interface StorageFileLike {
  name: string;
  delete(options?: { ignoreNotFound?: boolean }): Promise<unknown>;
}

export interface StorageBucketLike {
  getFiles(options: { prefix: string }): Promise<[StorageFileLike[]]>;
}

export interface AuthLike {
  deleteUser(userId: string): Promise<void>;
}

export interface DeletionProcessorDependencies {
  auth: AuthLike;
  bucket: StorageBucketLike;
  db: Firestore;
  logger: Pick<Console, "error" | "info" | "warn">;
  nowIso(): string;
}

export interface NormalizedUserDeletionRequest extends UserDeletionRequest {
  status: UserDeletionRequestStatus;
}

export interface ProcessUserDeletionRequestInput {
  requestData: unknown;
  requestId: string;
  deps: DeletionProcessorDependencies;
}

export type ProcessUserDeletionRequestOutcome =
  | {
      ok: true;
      status: "completed" | "skipped";
      auditLogId: string;
      userId: string;
    }
  | {
      ok: false;
      status: "failed";
      auditLogId: string;
      failureReason: string;
      userId: string;
    };

export interface FirestoreDeletionResult {
  deletedDocumentCount: number;
  ownerDocumentPaths: readonly string[];
  queryByUserIdCollections: readonly string[];
}

export interface StorageDeletionResult {
  deletedFileCount: number;
  prefixes: readonly string[];
}

export interface AuthDeletionResult {
  deleted: boolean;
  userId: string;
}

export function assertSafeUserId(userId: string): string {
  if (!userId || userId.includes("/") || userId.includes("..")) {
    throw new Error("Invalid user deletion request identifier.");
  }

  return userId;
}
