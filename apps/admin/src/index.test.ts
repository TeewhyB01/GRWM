import assert from "node:assert/strict";
import test from "node:test";

import { adminFoundation } from "./index.ts";

test("@grwm/admin is reserved for a TypeScript Next.js dashboard", () => {
  assert.equal(adminFoundation.framework, "nextjs");
  assert.equal(adminFoundation.language, "typescript");
});

test("@grwm/admin plans role-aware admin access", () => {
  assert.ok(adminFoundation.plannedRoles.includes("admin"));
});
