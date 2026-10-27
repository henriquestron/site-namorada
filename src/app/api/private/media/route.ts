import { randomUUID } from "node:crypto";
import { failure, json, readBytes, requireAdmin, sameOrigin } from "@/lib/server/private-http";
import { BUCKET, HttpError, supabase } from "@/lib/server/surprise-store";
import { MAX_MEDIA_BYTES, mediaExtension } from "@/lib/server/media";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const bytes = await readBytes(request, MAX_MEDIA_BYTES);
    const type = request.headers.get("content-type")?.split(";")[0] ?? "";
    const extension = mediaExtension(type, bytes);
    if (!extension) throw new HttpError(415, "Use JPG, PNG, WebP, MP3, M4A, OGG, WAV ou WebM válidos (até 3 MB).");
    const asset = `${randomUUID()}.${extension}`;
    await supabase(`/storage/v1/object/${BUCKET}/${asset}`, { method: "POST", headers: { "Content-Type": type, "Cache-Control": "private, no-store", "x-upsert": "false" }, body: new Uint8Array(bytes) });
    return json({ asset }, 201);
  } catch (error) { return failure(error); }
}
