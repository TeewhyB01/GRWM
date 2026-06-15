import type { PrivacyConsent } from "./types";

export type ConsentGateInput = PrivacyConsent | null | undefined;

function hasRecordedPrivacyConsent(consent: ConsentGateInput): consent is PrivacyConsent {
  return Boolean(consent?.userId && consent.version && consent.source === "mobile");
}

export function canUploadWardrobePhoto(consent: ConsentGateInput): boolean {
  return hasRecordedPrivacyConsent(consent);
}

export function canRequestWardrobePhotoAnalysis(consent: ConsentGateInput): boolean {
  return hasRecordedPrivacyConsent(consent) && consent.wardrobePhotoAnalysis === true;
}

export function canUseLocationWeather(consent: ConsentGateInput): boolean {
  return hasRecordedPrivacyConsent(consent) && consent.locationWeatherUse === true;
}

export function canCreateAvatar(consent: ConsentGateInput): boolean {
  return hasRecordedPrivacyConsent(consent) && consent.avatarCreation === true;
}
