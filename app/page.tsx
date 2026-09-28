import { getLeads } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const revalidate = 0;

export default async function DashboardPage() {
  const leads = await getLeads();
  return <DashboardClient leads={leads} />;
}
