import type {
  WardrobeCategoryPreference,
  WardrobeSetupProfile,
  WardrobeStyleBasics
} from "@grwm/shared";

export type {
  WardrobeCategoryPreference,
  WardrobeColourFamily,
  WardrobeModestyPreference,
  WardrobeOutfitFormality,
  WardrobeSetupProfile,
  WardrobeSetupRelevance,
  WardrobeSetupStatus,
  WardrobeStyleBasics,
  WardrobeTypicalDressCode
} from "@grwm/shared";

export interface WardrobeSetupDraftInput {
  selectedCategories?: readonly WardrobeCategoryPreference[];
  styleBasics?: Partial<WardrobeStyleBasics>;
}

export interface WardrobeSetupDocumentInput extends WardrobeSetupDraftInput {
  existingProfile?: WardrobeSetupProfile | null;
  nowIso: string;
  setupStatus?: WardrobeSetupProfile["setupStatus"];
  userId: string;
}
