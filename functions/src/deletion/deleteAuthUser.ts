import type {
  AuthDeletionResult,
  AuthLike
} from "./types.ts";

function isAuthUserNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "auth/user-not-found"
  );
}

export async function deleteAuthUser(
  auth: AuthLike,
  userId: string
): Promise<AuthDeletionResult> {
  try {
    await auth.deleteUser(userId);

    return {
      deleted: true,
      userId
    };
  } catch (error) {
    if (isAuthUserNotFoundError(error)) {
      return {
        deleted: false,
        userId
      };
    }

    throw error;
  }
}
