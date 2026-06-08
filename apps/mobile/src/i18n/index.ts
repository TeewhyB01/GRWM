import { DEFAULT_LOCALE } from "@grwm/shared";

import { en } from "./locales/en.ts";

export const resources = {
  en
} as const;

export const supportedLocales = Object.keys(resources) as Array<keyof typeof resources>;

export type MobileLocale = keyof typeof resources;
export type MobileMessages = (typeof resources)[MobileLocale];

export function getMessages(locale: MobileLocale = DEFAULT_LOCALE): MobileMessages {
  return resources[locale];
}
