import test from "node:test";
import assert from "node:assert/strict";
import { isPublicAuthRoute } from "../tenant/lib/auth-routes.ts";

test("login and tenant registration are public routes", () => {
  assert.equal(isPublicAuthRoute("/login"), true);
  assert.equal(isPublicAuthRoute("/register"), true);
});

test("tenant workspace routes remain protected", () => {
  assert.equal(isPublicAuthRoute("/"), false);
  assert.equal(isPublicAuthRoute("/appointments"), false);
});
