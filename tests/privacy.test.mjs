import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import { emptyContent, emptyItem, validateContent, validatePublication, publicSnapshot, referencedAssets, assetPattern } from "../src/lib/surprises.ts";
import { signSession, verifySession, checkPassword, SESSION_SECONDS } from "../src/lib/server/security.ts";
import { mediaExtension } from "../src/lib/server/media.ts";

const salt = randomBytes(16).toString("hex"), password = randomBytes(24).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const secret = randomBytes(48).toString("hex"), now = Date.parse("2030-01-01T00:00:00Z");
function content(id = "timeline") {
  return { ...emptyContent(id), intro: "PRIVATE INTRO CANARY", items: [{ ...emptyItem("test-item"), text: "PRIVATE BODY CANARY", date: "2030-01-01", image: "a1b2c3d4-1234-4234-8234-123456789abc.jpg" }] };
}
test("correct password is verified; wrong, missing and malformed passwords fail", () => {
  assert.equal(checkPassword(password, hash), true);
  for (const value of ["wrong", null, {}, "a".repeat(257)]) assert.equal(checkPassword(value, hash), false);
  assert.equal(checkPassword(password, "unset"), false);
});
test("signed admin session expires and cannot be extended by a client", () => {
  const token = signSession(secret, hash, now);
  assert.equal(verifySession(token, secret, hash, now), true);
  assert.equal(verifySession(token, secret, hash, now + SESSION_SECONDS * 1000), false);
  const [payload, signature] = token.split(".");
  const parsed = JSON.parse(Buffer.from(payload, "base64url")); parsed.exp += 100000;
  assert.equal(verifySession(`${Buffer.from(JSON.stringify(parsed)).toString("base64url")}.${signature}`, secret, hash, now), false);
});
test("session rejects forged tokens and is invalidated by credential rotation", () => {
  const token = signSession(secret, hash, now);
  for (const value of [undefined, "admin", token + ".extra", "x.y", "a".repeat(1025)]) assert.equal(verifySession(value, secret, hash, now), false);
  assert.equal(verifySession(token, secret + "rotated", hash, now), false);
  assert.equal(verifySession(token, secret, hash.replace(salt, randomBytes(16).toString("hex")), now), false);
});
test("an unreleased section has no public representation", () => {
  assert.equal(publicSnapshot("timeline", null, now), null);
});
test("a future capsule exposes neither message, intro nor media identifiers", () => {
  const draft = { ...content("capsule"), unlockAt: "2031-01-01T00:00:00Z" };
  const snapshot = publicSnapshot("capsule", draft, now), serialized = JSON.stringify(snapshot);
  assert.equal(snapshot.locked, true);
  assert.deepEqual(snapshot.content.items, []);
  assert.equal(snapshot.content.intro, "");
  assert.equal(serialized.includes("PRIVATE"), false);
  assert.equal(serialized.includes(draft.items[0].image), false);
  assert.equal(referencedAssets(snapshot.content).size, 0);
});
test("capsule is released exactly when the server clock reaches its deadline", () => {
  const draft = { ...content("capsule"), unlockAt: "2031-01-01T00:00:00Z" };
  const deadline = Date.parse(draft.unlockAt);
  assert.equal(publicSnapshot("capsule", draft, deadline - 1).locked, true);
  assert.equal(publicSnapshot("capsule", draft, deadline).locked, false);
  assert.equal(publicSnapshot("capsule", draft, deadline).content.items[0].text, "PRIVATE BODY CANARY");
});
test("published snapshots do not share references with a subsequent draft", () => {
  const published = content(); const snapshot = publicSnapshot("timeline", published, now);
  published.items[0].text = "NEW PRIVATE REVISION";
  assert.equal(snapshot.content.items[0].text, "PRIVATE BODY CANARY");
  assert.equal(JSON.stringify(snapshot).includes("NEW PRIVATE REVISION"), false);
});
test("content validation removes unknown fields and refuses external asset URLs", () => {
  const draft = content(); assert.equal(validateContent({ ...draft, secret: "never copied" }).secret, undefined);
  draft.items[0].image = "https://example.org/private.jpg";
  assert.throws(() => validateContent(draft), /Arquivo inválido/);
});
test("traversal and incorrect media formats are not accepted", () => {
  for (const value of ["../secret.jpg", "name.svg", "a/b.jpg", "%2e%2e", "https://example.org"]) assert.equal(assetPattern.test(value), false);
  const draft = content(); draft.items[0].audio = draft.items[0].image;
  assert.throws(() => validateContent(draft), /Arquivo inválido/);
});
test("publishing requires content, a capsule date, timeline dates and voice files", () => {
  assert.throws(() => validatePublication("timeline", emptyContent("timeline")), /pelo menos/);
  assert.throws(() => validatePublication("capsule", content("capsule")), /data e o horário/);
  assert.throws(() => validatePublication("voice", content("voice")), /áudio/);
  const draft = content(); draft.items[0].date = "";
  assert.throws(() => validatePublication("timeline", draft), /data/);
});
test("unknown letters, duplicate IDs and invalid star positions fail validation", () => {
  const draft = content(); draft.items.push({ ...draft.items[0] });
  assert.throws(() => validateContent(draft), /repetido/);
  draft.items.pop(); draft.items[0].letter = "unknown";
  assert.throws(() => validateContent(draft), /Cartinha/);
  draft.items[0].letter = ""; draft.items[0].x = NaN;
  assert.throws(() => validateContent(draft), /Posição/);
});
test("upload sniffs file signatures and refuses HTML disguised as an image", () => {
  assert.equal(mediaExtension("image/jpeg", Buffer.from("<html>not a photo</html>")), null);
  assert.equal(mediaExtension("image/svg+xml", Buffer.from("<svg/>")), null);
  assert.equal(mediaExtension("image/png", Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "png");
  assert.equal(mediaExtension("audio/mpeg", Buffer.from("ID3 test")), "mp3");
});
