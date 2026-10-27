import { failure, json } from "@/lib/server/private-http";
import { publicSections } from "@/lib/server/surprise-store";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return json({ sections: await publicSections() }); }
  catch (error) { return failure(error); }
}
