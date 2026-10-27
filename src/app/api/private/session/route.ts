import { createHmac } from "node:crypto";
import { authConfig, cookieName, failure, isAdmin, json, readJson, sameOrigin } from "@/lib/server/private-http";
import { checkPassword, SESSION_SECONDS, signSession } from "@/lib/server/security";
import { HttpError, rpc } from "@/lib/server/surprise-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { return json({ authenticated: await isAdmin() }); }
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { secret, passwordHash } = authConfig();
    const body = await readJson(request, 2048);
    // Atomic shared limit survives serverless cold starts. Global cap also prevents spoofed IP bypass.
    // Vercel overwrites x-vercel-forwarded-for. Other hosts still have the global cap.
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "unknown" : "self-hosted";
    const key = createHmac("sha256", secret).update(ip).digest("hex");
    if (!(await rpc("surprise_login_attempt", { client_key: key }))) throw new HttpError(429, "Muitas tentativas. Aguarde 15 minutos e tente novamente.");
    if (!checkPassword(body?.password, passwordHash)) throw new HttpError(401, "Senha incorreta.");
    const response = json({ authenticated: true });
    response.cookies.set(cookieName(), signSession(secret, passwordHash), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: SESSION_SECONDS, path: "/" });
    return response;
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const response = json({ authenticated: false });
    response.cookies.set(cookieName(), "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 0, path: "/" });
    return response;
  } catch (error) { return failure(error); }
}
