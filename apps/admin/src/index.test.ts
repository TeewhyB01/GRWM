import assert from "node:assert/strict";
import test from "node:test";

import {
  adminFirebaseEnvKeys,
  adminFoundation,
  adminRoleOptions,
  adminRoutes,
  canAccessAdminRoute,
  getAdminSessionPlaceholder,
  isAdminFirebaseConfigured,
  loginAdminPlaceholder,
  validateAdminRole
} from "./index.ts";

test("@grwm/admin is reserved for a TypeScript Next.js dashboard", () => {
  assert.equal(adminFoundation.framework, "nextjs");
  assert.equal(adminFoundation.language, "typescript");
});

test("@grwm/admin plans role-aware admin access", () => {
  assert.ok(adminFoundation.plannedRoles.includes("admin"));
  assert.deepEqual(adminRoleOptions, ["owner", "admin", "moderator", "support", "analyst"]);
});

test("@grwm/admin defines the Phase 1 admin routes", () => {
  assert.deepEqual(
    adminRoutes.map((route) => route.id),
    ["dashboard", "users", "ai-monitoring", "moderation", "subscriptions", "affiliate", "settings"]
  );
});

test("@grwm/admin protects routes through a placeholder session", () => {
  assert.equal(canAccessAdminRoute("dashboard", getAdminSessionPlaceholder()), true);
  assert.equal(canAccessAdminRoute("settings", { ...getAdminSessionPlaceholder(), roles: ["support"] }), false);
  assert.equal(validateAdminRole("analyst"), true);
  assert.equal(validateAdminRole("stylist-ops"), false);
});

test("@grwm/admin defines Firebase Auth client config without hardcoded keys", () => {
  assert.equal(isAdminFirebaseConfigured(), false);
  assert.ok(adminFirebaseEnvKeys.includes("NEXT_PUBLIC_FIREBASE_API_KEY"));
  assert.equal(loginAdminPlaceholder({ email: "owner@example.com", password: "not-used-yet" }).email, "owner@example.com");
});
