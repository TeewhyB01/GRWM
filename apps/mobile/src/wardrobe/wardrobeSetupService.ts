import {
  firestoreCollections,
  isWardrobeSetupProfile,
  isWardrobeStyleBasics,
  type WardrobeSetupProfile,
  type WardrobeStyleBasics
} from "@grwm/shared";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { getMobileFirestore } from "../firebase/client.ts";
import type {
  WardrobeSetupDocumentInput,
  WardrobeSetupDraftInput
} from "./wardrobeSetupTypes.ts";

export function createDefaultWardrobeStyleBasics(): WardrobeStyleBasics {
  return {
    typicalDressCode: "",
    preferredOutfitFormality: "",
    favouriteColourFamilies: [],
    coloursToAvoid: [],
    modestyPreference: "",
    workwearRelevance: "not_relevant",
    occasionwearRelevance: "not_relevant"
  };
}

export function mergeWardrobeStyleBasics(
  existingStyleBasics: WardrobeStyleBasics | null | undefined,
  updates: Partial<WardrobeStyleBasics> | null | undefined
): WardrobeStyleBasics {
  return {
    ...createDefaultWardrobeStyleBasics(),
    ...(existingStyleBasics ?? {}),
    ...(updates ?? {})
  };
}

export function createWardrobeSetupProfileDocument(
  params: WardrobeSetupDocumentInput
): WardrobeSetupProfile {
  const existingProfile = params.existingProfile ?? null;
  const setupStatus = params.setupStatus ?? existingProfile?.setupStatus ?? "in_progress";
  const profile: WardrobeSetupProfile = {
    id: params.userId,
    userId: params.userId,
    selectedCategories:
      params.selectedCategories ?? existingProfile?.selectedCategories ?? [],
    styleBasics: mergeWardrobeStyleBasics(
      existingProfile?.styleBasics,
      params.styleBasics
    ),
    setupStatus,
    source: "mobile",
    createdAt: existingProfile?.createdAt ?? params.nowIso,
    updatedAt: params.nowIso,
    completedAt: setupStatus === "completed" ? params.nowIso : ""
  };

  if (!validateWardrobeSetupProfileDocument(profile)) {
    throw new Error("Invalid wardrobe setup profile.");
  }

  return profile;
}

export function validateWardrobeSetupProfileDocument(
  profile: WardrobeSetupProfile
): boolean {
  return isWardrobeSetupProfile(profile) && isWardrobeStyleBasics(profile.styleBasics);
}

export async function getWardrobeSetupProfile(
  userId: string
): Promise<WardrobeSetupProfile | null> {
  const snapshot = await getDoc(
    doc(getMobileFirestore(), firestoreCollections.wardrobeSetupProfiles, userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  const profile = snapshot.data() as WardrobeSetupProfile;

  if (!validateWardrobeSetupProfileDocument(profile)) {
    throw new Error("Wardrobe setup profile has an unsupported shape.");
  }

  return profile;
}

export async function saveWardrobeSetupDraft(
  userId: string,
  data: WardrobeSetupDraftInput,
  nowIso = new Date().toISOString()
): Promise<WardrobeSetupProfile> {
  const existingProfile = await getWardrobeSetupProfile(userId);
  const profile = createWardrobeSetupProfileDocument({
    ...data,
    existingProfile,
    nowIso,
    setupStatus: "in_progress",
    userId
  });

  await setDoc(
    doc(getMobileFirestore(), firestoreCollections.wardrobeSetupProfiles, userId),
    profile,
    { merge: true }
  );

  return profile;
}

export async function completeWardrobeSetup(
  userId: string,
  data: WardrobeSetupDraftInput,
  nowIso = new Date().toISOString()
): Promise<WardrobeSetupProfile> {
  const existingProfile = await getWardrobeSetupProfile(userId);
  const profile = createWardrobeSetupProfileDocument({
    ...data,
    existingProfile,
    nowIso,
    setupStatus: "completed",
    userId
  });

  await setDoc(
    doc(getMobileFirestore(), firestoreCollections.wardrobeSetupProfiles, userId),
    profile,
    { merge: true }
  );

  return profile;
}

export async function resetWardrobeSetup(
  userId: string,
  nowIso = new Date().toISOString()
): Promise<WardrobeSetupProfile> {
  const existingProfile = await getWardrobeSetupProfile(userId);
  const profile = createWardrobeSetupProfileDocument({
    existingProfile,
    nowIso,
    selectedCategories: [],
    setupStatus: "not_started",
    styleBasics: createDefaultWardrobeStyleBasics(),
    userId
  });

  await setDoc(
    doc(getMobileFirestore(), firestoreCollections.wardrobeSetupProfiles, userId),
    profile,
    { merge: true }
  );

  return profile;
}
