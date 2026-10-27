import test from "node:test";
import assert from "node:assert/strict";
import { publicStartingSections, mergePublicSections, hasSavedContent, startingContent, includeTimelineMoments, includeSectionUpdates } from "../src/lib/public-surprises.ts";
import { emptyContent, mediaUrl, publicSnapshot, sectionIds, validateContent, isSectionId } from "../src/lib/surprises.ts";

test("all four active sections exist before any database or password is configured", () => {
  assert.deepEqual(publicStartingSections.map((section) => section.id), [...sectionIds]);
  assert.equal(publicStartingSections.every((section) => !section.locked), true);
});
test("one edited section keeps the other three public sections visible", () => {
  const override = { id: "reasons", locked: false, content: { ...emptyContent("reasons"), title: "Edited title" } };
  const merged = mergePublicSections([override]);
  assert.equal(merged.length, 4);
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
  const locked = publicSnapshot("capsule", content);
  assert.equal(locked.locked, true);
  const merged = mergePublicSections([locked]).find((section) => section.id === "capsule");
  assert.equal(merged.locked, true);
  assert.equal(merged.content.unlockAt, content.unlockAt);
  assert.deepEqual(merged.content.items, []);
});
test("older saved timelines keep their own edits while receiving the new moments in date order", () => {
  const original = startingContent("timeline");
  const old = { ...original, title: "My own timeline", items: [original.items.at(-1), { ...original.items[0], text: "My edited beginning" }] };
  delete old.timelineRevision;
  const snapshot = mergePublicSections([{ id: "timeline", content: old, locked: false }]).find((section) => section.id === "timeline");
  assert.equal(snapshot.content.title, old.title);
  assert.equal(snapshot.content.items[0].text, "My edited beginning");
  assert.equal(snapshot.content.items.length, original.items.length);
  assert.deepEqual(snapshot.content.items.map((entry) => entry.date), original.items.map((entry) => entry.date));
  assert.equal(old.items.length, 2);
});
test("saving the timeline revision prevents duplicate additions and preserves later removals", () => {
  const upgraded = includeTimelineMoments(emptyContent("timeline"));
  const saved = validateContent(upgraded);
  assert.deepEqual(includeTimelineMoments(saved), saved);
  saved.items.pop();
  assert.equal(includeTimelineMoments(saved).items.length, saved.items.length);
});
test("a manually added matching moment is preserved without a duplicate", () => {
  const original = startingContent("timeline");
  const savedItem = { ...original.items[1], id: "my-own-id" };
  const updated = includeTimelineMoments({ ...emptyContent("timeline"), items: [savedItem] });
  assert.equal(updated.items.filter((entry) => entry.date === savedItem.date).length, 1);
  assert.equal(updated.items.find((entry) => entry.date === savedItem.date).id, "my-own-id");
});
test("removed stars and voice sections stay absent even when legacy database rows exist", () => {
  const legacy = ["stars", "voice"].map((id) => ({ id, content: emptyContent(id), locked: false }));
  const merged = mergePublicSections(legacy);
  assert.deepEqual(merged.map((entry) => entry.id), [...sectionIds]);
  assert.equal(isSectionId("stars"), false);
  assert.equal(isSectionId("voice"), false);
});
test("the requested future letter replaces an old scheduled capsule and remains editable after saving", () => {
  const old = { ...emptyContent("capsule"), unlockAt: "2099-01-01T03:00:00Z" };
  const updated = includeSectionUpdates("capsule", old);
  assert.equal(updated.unlockAt, "");
  assert.equal(updated.items.length, 1);
  const saved = validateContent(updated);
  saved.items[0].text = "Later editor change";
  assert.equal(includeSectionUpdates("capsule", saved).items[0].text, "Later editor change");
});
