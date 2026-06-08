import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LOCALE,
  FIREBASE_SERVICES,
  PRIVACY_FIRST_PRODUCT_PRINCIPLE
} from "./index.ts";

test("@grwm/shared keeps English as the launch locale", () => {
  assert.equal(DEFAULT_LOCALE, "en");
});

test("@grwm/shared documents required Firebase services", () => {
  assert.ok(FIREBASE_SERVICES.includes("authentication"));
  assert.ok(FIREBASE_SERVICES.includes("cloud-firestore"));
  assert.ok(FIREBASE_SERVICES.includes("storage"));
  assert.ok(FIREBASE_SERVICES.includes("cloud-functions"));
});

test("@grwm/shared keeps privacy first in the shared foundation", () => {
  assert.match(PRIVACY_FIRST_PRODUCT_PRINCIPLE, /needed/);
});
