import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validPasswordHash, verifySession } from "./security";
import { HttpError, storageConfigured } from "./surprise-store";

export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0", "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff", "Vary": "Cookie",
};
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: PRIVATE_HEADERS }); }
export function authConfig() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "", passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (secret.length < 32 || !validPasswordHash(passwordHash)) throw new HttpError(503, "A área privada ainda não foi configurada.");
  return { secret, passwordHash };
}
export function privateConfigured() {
  try { authConfig(); return storageConfigured() && Boolean(process.env.APP_ORIGIN); } catch { return false; }
}
export function cookieName() { return process.env.NODE_ENV === "production" ? "__Host-vy_admin" : "vy_admin"; }
export async function isAdmin() {
  try {
    const { secret, passwordHash } = authConfig();
    return verifySession((await cookies()).get(cookieName())?.value, secret, passwordHash);
  } catch { return false; }
}
export async function requireAdmin() { if (!(await isAdmin())) throw new HttpError(401, "Entre novamente para continuar."); }
export function sameOrigin(request: Request) {
  const expected = process.env.APP_ORIGIN;
  // Require an explicitly configured origin, rather than trusting Host / forwarded headers.
  if (!expected) throw new HttpError(503, "A área privada ainda não foi configurada.");
  if (request.headers.get("origin") !== new URL(expected).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Origem não permitida.");
}
export async function readBytes(request: Request, max: number) {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) throw new HttpError(413, "Arquivo ou conteúdo muito grande.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Conteúdo vazio.");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > max) { await reader.cancel(); throw new HttpError(413, "Arquivo ou conteúdo muito grande."); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, length);
}
export async function readJson(request: Request, max = 200000) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Envie conteúdo JSON.");
  try { return JSON.parse((await readBytes(request, max)).toString("utf8")); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Conteúdo inválido."); }
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  return json({ error: "Não foi possível concluir. Tente novamente." }, 500);
}
