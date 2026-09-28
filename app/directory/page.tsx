import { getLeads } from "@/lib/supabase/server";
import { DirectoryClient } from "@/components/directory/directory-client";

export const revalidate = 0;

export default async function DirectoryPage() {
  const leads = await getLeads();
  return <DirectoryClient leads={leads} />;
}
