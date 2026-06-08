import assert from "node:assert/strict";
import test from "node:test";

import { functionsFoundation } from "./index.ts";

test("@grwm/functions targets Firebase Cloud Functions", () => {
  assert.equal(functionsFoundation.runtime, "firebase-cloud-functions");
});

test("@grwm/functions keeps sensitive logging disabled by default", () => {
  assert.equal(functionsFoundation.sensitiveLoggingAllowed, false);
});
