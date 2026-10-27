import "server-only";
import { type AdminSurprise, type PublicSurprise, publicSnapshot, referencedAssets } from "../surprises";
import { hasSavedContent, includeSectionUpdates, mergePublicSections, startingContent } from "../public-surprises";

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export const BUCKET = "private-surprises";
export function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function config() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, "A área privada ainda não foi configurada.");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "127.0.0.1")) throw new HttpError(503, "Configuração privada inválida.");
  return { url: parsed.origin, key };
}
export async function supabase(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const headers = new Headers(init.headers);
  headers.set("apikey", key); headers.set("Authorization", `Bearer ${key}`);
  let response: Response;
  try { response = await fetch(`${url}${path}`, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15000) }); }
  catch { throw new HttpError(503, "O armazenamento privado não respondeu. Tente novamente."); }
  if (!response.ok) {
    // Do not log or return provider responses: they may contain personal content.
    if (response.status === 409) throw new HttpError(409, "O conteúdo mudou em outra aba. Recarregue antes de salvar.");
    throw new HttpError(503, "Não foi possível acessar o armazenamento privado. Verifique a configuração.");
  }
  return response;
}
export async function rpc(name: string, input: object) {
  const response = await supabase(`/rest/v1/rpc/${name}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  return response.json();
}
export async function adminSections(): Promise<AdminSurprise[]> {
  const response = await supabase("/rest/v1/surprise_sections?select=id,draft,published,version,published_at&order=id");
  const rows: AdminSurprise[] = await response.json();
  return rows.map((row) => {
    const draft = hasSavedContent(row) ? row.draft : startingContent(row.id);
    return { ...row, draft: includeSectionUpdates(row.id, draft) };
  });
}
export async function publicSections(): Promise<PublicSurprise[]> {
  if (!storageConfigured()) return mergePublicSections([]);
  try {
    // Public mode requested by Vitor: all saved section content is now visible.
    const response = await supabase("/rest/v1/surprise_sections?select=id,draft,version");
    const rows: Pick<AdminSurprise, "id" | "draft" | "version">[] = await response.json();
    const snapshots = rows.filter(hasSavedContent).map((row) => publicSnapshot(row.id, row.draft))
      .filter((row): row is PublicSurprise => row !== null);
    return mergePublicSections(snapshots);
  } catch { return mergePublicSections([]); }
}
export async function publicAssetAllowed(asset: string) {
  return (await publicSections()).some((section) => !section.locked && referencedAssets(section.content).has(asset));
}
