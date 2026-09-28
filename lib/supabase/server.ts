import { createClient } from "@supabase/supabase-js";
import { Lead } from "@/lib/types/lead";
import { MOCK_LEADS } from "./mock-data";

/**
 * Creates a server-side Supabase client using secret keys.
 * NEVER call this function inside browser React components.
 */
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Fetches all leads from Supabase `public.leads` table.
 * Fallbacks gracefully to MOCK_LEADS if Supabase is unreachable or credentials fail.
 */
export async function getLeads(): Promise<Lead[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    console.warn("Supabase credentials unconfigured. Displaying development mock data.");
    return MOCK_LEADS;
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase query error in getLeads, falling back to mock data:", error.message);
      return MOCK_LEADS;
    }

    return (data && data.length > 0) ? (data as Lead[]) : MOCK_LEADS;
  } catch (err: any) {
    console.warn("Network / Supabase connection error in getLeads, displaying mock data:", err?.message || err);
    return MOCK_LEADS;
  }
}

/**
 * Fetches a single lead by ID or domain from Supabase `public.leads` table.
 * Fallbacks to MOCK_LEADS if database query fails or yields no match.
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const cleanId = decodeURIComponent(id).trim().replace(/^https?:\/\//, "").replace(/\/$/, "");

  const findMock = () => {
    return (
      MOCK_LEADS.find(
        (item) => item.id === cleanId || item.domain === cleanId || encodeURIComponent(item.domain || "") === cleanId
      ) || null
    );
  };

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return findMock();
  }

  try {
    // 1. Check by ID first
    let { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", cleanId)
      .maybeSingle();

    // 2. If no match by ID or if ID is a domain string, search by domain
    if (!data) {
      const domainQuery = await supabase
        .from("leads")
        .select("*")
        .eq("domain", cleanId)
        .maybeSingle();

      if (domainQuery.data) {
        data = domainQuery.data;
      } else {
        const altDomain = cleanId.startsWith("www.")
          ? cleanId.replace("www.", "")
          : `www.${cleanId}`;

        const altQuery = await supabase
          .from("leads")
          .select("*")
          .eq("domain", altDomain)
          .maybeSingle();

        data = altQuery.data;
      }
    }

    if (!data) {
      return findMock();
    }

    return data as Lead;
  } catch (err: any) {
    console.warn("Supabase connection error in getLeadById, using mock data:", err?.message || err);
    return findMock();
  }
}
