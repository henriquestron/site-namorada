import test from "node:test";
import assert from "node:assert/strict";
import { publicStartingSections, mergePublicSections, hasSavedContent, startingContent } from "../src/lib/public-surprises.ts";
import { emptyContent, mediaUrl, publicSnapshot, sectionIds, validateContent } from "../src/lib/surprises.ts";

test("all six sections exist before any database or password is configured", () => {
  assert.deepEqual(publicStartingSections.map((section) => section.id), [...sectionIds]);
  assert.equal(publicStartingSections.every((section) => !section.locked), true);
});
test("one edited section keeps the other five public sections visible", () => {
  const override = { id: "reasons", locked: false, content: { ...emptyContent("reasons"), title: "Edited title" } };
  const merged = mergePublicSections([override]);
  assert.equal(merged.length, 6);
  assert.deepEqual(merged.map((section) => section.id), [...sectionIds]);
  assert.equal(merged.find((section) => section.id === "reasons").content.title, "Edited title");
});
test("untouched seed rows use public starting content; a saved empty section is intentional", () => {
  assert.equal(hasSavedContent({ version: 0, draft: emptyContent("timeline") }), false);
  assert.equal(hasSavedContent({ version: 1, draft: emptyContent("timeline") }), true);
  assert.equal(hasSavedContent({ version: 0, draft: startingContent("timeline") }), true);
});
test("existing public photos work directly; external and traversal paths remain invalid", () => {
  const content = startingContent("timeline");
  assert.deepEqual(validateContent(content), content);
  assert.equal(mediaUrl("/memorias/foto-pedido.webp"), "/memorias/foto-pedido.webp");
  content.items[0].image = "/memorias/../../secret.webp";
  assert.throws(() => validateContent(content), /Arquivo inválido/);
  content.items[0].image = "https://example.org/image.webp";
  assert.throws(() => validateContent(content), /Arquivo inválido/);
});
test("capsule is public without a schedule; an explicitly scheduled future letter waits", () => {
  const content = startingContent("capsule");
  assert.equal(publicSnapshot("capsule", content).locked, false);
  content.unlockAt = "2099-01-01T03:00:00Z";
  assert.equal(publicSnapshot("capsule", content).locked, true);
});
