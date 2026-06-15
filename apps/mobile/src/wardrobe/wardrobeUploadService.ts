import {
  MAX_WARDROBE_IMAGE_BYTES,
  buildWardrobeUploadMetadataForDraft,
  canUploadWardrobePhoto,
  createWardrobeUploadDraftData,
  firestoreCollections,
  hasRequiredFields,
  isAllowedWardrobeImageContentType,
  isExpectedWardrobeUploadStoragePath,
  isWardrobeCategory,
  wardrobeItemSchema,
  type PrivacyConsent,
  type WardrobeImageContentType,
  type WardrobeItem,
  type WardrobeUploadMetadata
} from "@grwm/shared";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as createStorageRef,
  uploadBytesResumable,
  type UploadTask
} from "firebase/storage";

import { getMobileFirestore, getMobileStorage } from "../firebase/client.ts";
import type {
  WardrobeImageAssetInput,
  WardrobeImageValidationResult,
  WardrobeListItem,
  WardrobeUploadDependencies,
  WardrobeUploadOperation,
  WardrobeUploadPlan,
  WardrobeUploadProgressSnapshot,
  WardrobeUploadRequest,
  WardrobeUploadResult
} from "./wardrobeUploadTypes.ts";

const extensionToContentType: Record<string, WardrobeImageContentType> = {
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

function cleanFileName(value: string | null | undefined): string {
  const withoutQuery = (value ?? "").split("?")[0] ?? "";
  const withoutHash = withoutQuery.split("#")[0] ?? "";
  const parts = withoutHash.split("/");

  return parts[parts.length - 1] ?? "";
}

function extensionFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop();

  return extension?.toLowerCase() ?? "";
}

function readableMaxSize(): string {
  return `${Math.floor(MAX_WARDROBE_IMAGE_BYTES / (1024 * 1024))} MB`;
}

export function inferWardrobeImageContentType(
  asset: Pick<WardrobeImageAssetInput, "fileName" | "mimeType" | "uri">
): WardrobeImageContentType | null {
  if (asset.mimeType && isAllowedWardrobeImageContentType(asset.mimeType)) {
    return asset.mimeType;
  }

  if (asset.mimeType && !isAllowedWardrobeImageContentType(asset.mimeType)) {
    return null;
  }

  const fileName = cleanFileName(asset.fileName) || cleanFileName(asset.uri);
  const inferredContentType = extensionToContentType[extensionFromFileName(fileName)];

  return inferredContentType ?? null;
}

export function validateWardrobeImageSelection(params: {
  asset: WardrobeImageAssetInput | null;
  category: WardrobeUploadRequest["category"];
  primaryColour: string;
  userId: string | null;
}): WardrobeImageValidationResult {
  if (!params.userId) {
    return {
      ok: false,
      code: "auth_required",
      message: "Sign in before uploading a wardrobe photo."
    };
  }

  if (!params.asset?.uri.trim()) {
    return {
      ok: false,
      code: "file_missing",
      message: "Choose a wardrobe image before uploading."
    };
  }

  if (params.asset.type && params.asset.type !== "image") {
    return {
      ok: false,
      code: "invalid_asset_type",
      message: "Choose an image file for this wardrobe item."
    };
  }

  if (!isWardrobeCategory(params.category)) {
    return {
      ok: false,
      code: "category_required",
      message: "Choose a category before uploading."
    };
  }

  if (!params.primaryColour.trim()) {
    return {
      ok: false,
      code: "primary_colour_required",
      message: "Add a primary colour before uploading."
    };
  }

  const contentType = inferWardrobeImageContentType(params.asset);

  if (!contentType) {
    return {
      ok: false,
      code: "unsupported_content_type",
      message: "This image type is not supported. Choose a JPEG, PNG, WebP, HEIC, or HEIF image."
    };
  }

  if (params.asset.fileSize !== null && params.asset.fileSize !== undefined) {
    if (!Number.isSafeInteger(params.asset.fileSize) || params.asset.fileSize < 0) {
      return {
        ok: false,
        code: "invalid_file_size",
        message: "This image size could not be verified. Choose another image."
      };
    }

    if (params.asset.fileSize > MAX_WARDROBE_IMAGE_BYTES) {
      return {
        ok: false,
        code: "file_too_large",
        message: `Choose an image smaller than ${readableMaxSize()}.`
      };
    }
  }

  return {
    ok: true,
    image: {
      contentType,
      fileName: cleanFileName(params.asset.fileName) || cleanFileName(params.asset.uri),
      sizeBytes: params.asset.fileSize ?? null,
      uri: params.asset.uri
    }
  };
}

export function createWardrobeUploadPlan(params: {
  consent: PrivacyConsent;
  contentType: WardrobeImageContentType;
  itemId: string;
  nowIso: string;
  request: Omit<WardrobeUploadRequest, "consent" | "onProgress"> & {
    category: Exclude<WardrobeUploadRequest["category"], "">;
    userId: string;
  };
}): WardrobeUploadPlan {
  const draftParams: Parameters<typeof createWardrobeUploadDraftData>[0] = {
    category: params.request.category,
    consent: params.consent,
    itemId: params.itemId,
    nowIso: params.nowIso,
    primaryColour: params.request.primaryColour,
    source: "manual",
    uploadStatus: "upload_pending",
    userId: params.request.userId
  };

  if (params.request.name !== undefined) {
    draftParams.name = params.request.name;
  }

  if (params.request.notes !== undefined) {
    draftParams.notes = params.request.notes;
  }

  const draft = createWardrobeUploadDraftData(draftParams);

  if (
    !isExpectedWardrobeUploadStoragePath({
      itemId: draft.itemId,
      storagePath: draft.storagePath,
      userId: draft.userId
    })
  ) {
    throw new Error("Wardrobe upload storage path is invalid.");
  }

  const metadata = buildWardrobeUploadMetadataForDraft({
    consentVersion: params.consent.version,
    draft
  });

  return {
    contentType: params.contentType,
    draft,
    itemId: draft.itemId,
    metadata,
    storagePath: draft.storagePath
  };
}

export async function runWardrobeUploadWithDependencies(
  request: WardrobeUploadRequest,
  deps: WardrobeUploadDependencies
): Promise<WardrobeUploadResult> {
  const validation = validateWardrobeImageSelection({
    asset: request.asset,
    category: request.category,
    primaryColour: request.primaryColour,
    userId: request.userId
  });

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  if (!request.consent || !canUploadWardrobePhoto(request.consent)) {
    throw new Error("Save privacy consent before uploading wardrobe photos.");
  }

  if (!request.userId || !isWardrobeCategory(request.category)) {
    throw new Error("Wardrobe upload request is incomplete.");
  }

  const itemId = deps.createItemId();
  const planRequest: Omit<WardrobeUploadRequest, "consent" | "onProgress"> & {
    category: Exclude<WardrobeUploadRequest["category"], "">;
    userId: string;
  } = {
    asset: request.asset,
    category: request.category,
    primaryColour: request.primaryColour,
    userId: request.userId
  };

  if (request.name !== undefined) {
    planRequest.name = request.name;
  }

  if (request.notes !== undefined) {
    planRequest.notes = request.notes;
  }

  const plan = createWardrobeUploadPlan({
    consent: request.consent,
    contentType: validation.image.contentType,
    itemId,
    nowIso: deps.nowIso(),
    request: planRequest
  });

  await deps.createDraft({
    draft: plan.draft,
    itemId: plan.itemId
  });

  const uploadParams: Parameters<WardrobeUploadDependencies["uploadOriginal"]>[0] = {
    assetUri: validation.image.uri,
    contentType: plan.contentType,
    metadata: plan.metadata,
    storagePath: plan.storagePath
  };

  if (request.onProgress !== undefined) {
    uploadParams.onProgress = request.onProgress;
  }

  await deps.uploadOriginal(uploadParams);

  return {
    itemId: plan.itemId,
    storagePath: plan.storagePath
  };
}

function storageMetadataFromWardrobeMetadata(
  metadata: WardrobeUploadMetadata
): Record<string, string> {
  return {
    category: metadata.category,
    consentVersion: metadata.consentVersion,
    itemId: metadata.itemId,
    ownerId: metadata.ownerId,
    storagePath: metadata.storagePath,
    uploadCategory: metadata.uploadCategory,
    userId: metadata.userId
  };
}

async function blobFromUri(uri: string): Promise<Blob> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Unable to read the selected image.");
  }

  return response.blob();
}

function createProgressSnapshot(snapshot: {
  bytesTransferred: number;
  totalBytes: number;
}): WardrobeUploadProgressSnapshot {
  const totalBytes = snapshot.totalBytes > 0 ? snapshot.totalBytes : snapshot.bytesTransferred;

  return {
    bytesTransferred: snapshot.bytesTransferred,
    percent: totalBytes > 0 ? Math.round((snapshot.bytesTransferred / totalBytes) * 100) : 0,
    totalBytes
  };
}

export function startWardrobeImageUpload(request: WardrobeUploadRequest): WardrobeUploadOperation {
  let cancelled = false;
  let activeTask: UploadTask | null = null;

  const deps: WardrobeUploadDependencies = {
    createItemId() {
      return doc(collection(getMobileFirestore(), firestoreCollections.wardrobeItems)).id;
    },
    nowIso() {
      return new Date().toISOString();
    },
    async createDraft({ draft, itemId }) {
      if (cancelled) {
        throw new Error("Upload cancelled.");
      }

      await setDoc(doc(getMobileFirestore(), firestoreCollections.wardrobeItems, itemId), draft);
    },
    async uploadOriginal({ assetUri, contentType, metadata, onProgress, storagePath }) {
      if (cancelled) {
        throw new Error("Upload cancelled.");
      }

      const blob = await blobFromUri(assetUri);

      if (cancelled) {
        throw new Error("Upload cancelled.");
      }

      await new Promise<void>((resolve, reject) => {
        activeTask = uploadBytesResumable(
          createStorageRef(getMobileStorage(), storagePath),
          blob,
          {
            contentType,
            customMetadata: storageMetadataFromWardrobeMetadata(metadata)
          }
        );

        activeTask.on(
          "state_changed",
          (snapshot) => {
            onProgress?.(createProgressSnapshot(snapshot));
          },
          reject,
          () => resolve()
        );

        if (cancelled) {
          activeTask.cancel();
        }
      });
    }
  };

  return {
    cancel() {
      cancelled = true;
      activeTask?.cancel();
    },
    promise: runWardrobeUploadWithDependencies(request, deps)
  };
}

function wardrobeItemFromSnapshot(
  userId: string,
  snapshot: DocumentSnapshot | QueryDocumentSnapshot
): WardrobeListItem | null {
  const data = snapshot.data() as Partial<WardrobeItem>;
  const candidate = {
    ...data,
    notes: typeof data.notes === "string" ? data.notes : ""
  } as WardrobeItem;

  if (!hasRequiredFields(candidate, wardrobeItemSchema) || candidate.userId !== userId) {
    return null;
  }

  return candidate;
}

export function listenToUserWardrobeItems(params: {
  onError: (error: FirestoreError) => void;
  onItems: (items: WardrobeListItem[]) => void;
  userId: string;
}): Unsubscribe {
  const wardrobeQuery = query(
    collection(getMobileFirestore(), firestoreCollections.wardrobeItems),
    where("userId", "==", params.userId)
  );

  return onSnapshot(
    wardrobeQuery,
    (snapshot) => {
      const items = snapshot.docs
        .map((documentSnapshot) => wardrobeItemFromSnapshot(params.userId, documentSnapshot))
        .filter((item): item is WardrobeListItem => item !== null)
        .sort((left, right) => right.createdAtIso.localeCompare(left.createdAtIso));

      params.onItems(items);
    },
    params.onError
  );
}

export function listenToWardrobeItem(params: {
  itemId: string;
  onError: (error: FirestoreError) => void;
  onItem: (item: WardrobeListItem | null) => void;
  userId: string;
}): Unsubscribe {
  return onSnapshot(
    doc(getMobileFirestore(), firestoreCollections.wardrobeItems, params.itemId),
    (snapshot) => {
      params.onItem(snapshot.exists() ? wardrobeItemFromSnapshot(params.userId, snapshot) : null);
    },
    params.onError
  );
}

export async function resolveWardrobeItemThumbnailUri(item: WardrobeItem): Promise<string | null> {
  if (
    !isExpectedWardrobeUploadStoragePath({
      itemId: item.itemId,
      storagePath: item.storagePath,
      userId: item.userId
    })
  ) {
    return null;
  }

  return getDownloadURL(createStorageRef(getMobileStorage(), item.storagePath));
}
