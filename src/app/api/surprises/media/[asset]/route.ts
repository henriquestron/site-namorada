import { assetPattern } from "@/lib/surprises";
import { failure, isAdmin, PRIVATE_HEADERS } from "@/lib/server/private-http";
import { BUCKET, HttpError, publicAssetAllowed, supabase } from "@/lib/server/surprise-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: RouteContext<"/api/surprises/media/[asset]">) {
  try {
    const { asset } = await context.params;
    if (!assetPattern.test(asset)) throw new HttpError(404, "Arquivo não encontrado.");
    // Check every request, including Range requests. Never redirect to public/signed URLs.
    if (!(await isAdmin()) && !(await publicAssetAllowed(asset))) throw new HttpError(404, "Arquivo não encontrado.");
    const range = request.headers.get("range");
    const upstream = await supabase(`/storage/v1/object/authenticated/${BUCKET}/${asset}`, { headers: range ? { Range: range } : {} });
    const headers = new Headers(PRIVATE_HEADERS);
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name); if (value) headers.set(name, value);
    }
    headers.set("Content-Disposition", "inline");
    headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) { return failure(error); }
}
