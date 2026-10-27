import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const SESSION_SECONDS = 4 * 60 * 60;
export function validPasswordHash(value: string) { return /^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/.test(value); }
export function checkPassword(password: unknown, stored: string) {
  if (typeof password !== "string" || password.length > 256 || !validPasswordHash(stored)) return false;
  const [, salt, expected] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export function signSession(secret: string, passwordHash: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Math.floor(now / 1000) + SESSION_SECONDS, nonce: randomBytes(16).toString("hex") })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret + passwordHash).update(payload).digest("base64url")}`;
}
export function verifySession(token: string | undefined, secret: string, passwordHash: string, now = Date.now()) {
  if (!token || token.length > 1024 || secret.length < 32 || !validPasswordHash(passwordHash)) return false;
  const [payload, sig, extra] = token.split(".");
  if (!payload || !sig || extra !== undefined) return false;
  const expected = createHmac("sha256", secret + passwordHash).update(payload).digest();
  const supplied = Buffer.from(sig, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const seconds = Math.floor(now / 1000);
    return data.role === "admin" && Number.isInteger(data.exp) && data.exp > seconds && data.exp <= seconds + SESSION_SECONDS;
  } catch { return false; }
}
