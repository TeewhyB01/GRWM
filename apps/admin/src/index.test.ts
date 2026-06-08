import assert from "node:assert/strict";
import test from "node:test";

import { adminFoundation, adminRoutes, canAccessAdminRoute, getAdminSessionPlaceholder } from "./index.ts";

test("@grwm/admin is reserved for a TypeScript Next.js dashboard", () => {
  assert.equal(adminFoundation.framework, "nextjs");
  assert.equal(adminFoundation.language, "typescript");
});

test("@grwm/admin plans role-aware admin access", () => {
  assert.ok(adminFoundation.plannedRoles.includes("admin"));
});

test("@grwm/admin defines the Phase 1 admin routes", () => {
  assert.deepEqual(
    adminRoutes.map((route) => route.id),
    ["dashboard", "users", "ai-monitoring", "moderation", "subscriptions", "affiliate", "settings"]
  );
});

test("@grwm/admin protects routes through a placeholder session", () => {
  assert.equal(canAccessAdminRoute("dashboard", getAdminSessionPlaceholder()), true);
});
