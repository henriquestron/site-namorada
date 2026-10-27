import { isAdmin, privateConfigured } from "@/lib/server/private-http";
import { PrivateWorkshop } from "@/components/private-workshop";
export const dynamic = "force-dynamic";
export default async function Preparar() {
  return <PrivateWorkshop authenticated={await isAdmin()} configured={privateConfigured()} />;
}
