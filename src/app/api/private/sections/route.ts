import { failure, json, requireAdmin } from "@/lib/server/private-http";
import { adminSections } from "@/lib/server/surprise-store";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await requireAdmin(); return json({ sections: await adminSections() }); }
  catch (error) { return failure(error); }
}
