import { isSectionId, validateContent } from "@/lib/surprises";
import { failure, json, readJson, requireAdmin, sameOrigin } from "@/lib/server/private-http";
import { HttpError, rpc } from "@/lib/server/surprise-store";
export const dynamic = "force-dynamic";
export async function POST(request: Request, context: RouteContext<"/api/private/sections/[id]">) {
  try {
    sameOrigin(request); await requireAdmin();
    const { id } = await context.params;
    if (!isSectionId(id)) throw new HttpError(404, "Novidade não encontrada.");
    const body = await readJson(request);
    if (!Number.isInteger(body?.version) || body.version < 0 || !["save", "publish"].includes(body?.action)) throw new HttpError(400, "As novidades estão no modo público. Use Salvar no site.");
    let content = null;
    {
      try { content = validateContent(body.content); }
      catch (error) { throw new HttpError(400, error instanceof Error ? error.message : "Conteúdo inválido."); }
    }
    const section = await rpc("surprise_update", { section_id: id, expected_version: body.version, operation: "publish", content });
    if (!section) throw new HttpError(409, "O conteúdo mudou em outra aba. Copie suas alterações e recarregue.");
    return json({ section });
  } catch (error) { return failure(error); }
}
