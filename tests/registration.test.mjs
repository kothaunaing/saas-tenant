import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../tenant/lib/domain.ts";

test("slugify generates clean URL slugs from salon business names", () => {
  assert.equal(slugify("Bloom Beauty Studio"), "bloom-beauty-studio");
  assert.equal(slugify("L'Élégance Hair & Spa!"), "l-l-gance-hair-spa");
  assert.equal(slugify("   Studio  101   "), "studio-101");
  assert.equal(slugify("serenity-salon"), "serenity-salon");
  assert.equal(slugify("Spa---Specialists"), "spa-specialists");
});

test("slugify handles empty and single-word inputs safely", () => {
  assert.equal(slugify(""), "");
  assert.equal(slugify("Salon"), "salon");
  assert.equal(slugify("---"), "");
});
