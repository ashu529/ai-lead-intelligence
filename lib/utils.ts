import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Not available";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFitScore(score: number | null | undefined): {
  label: "High Fit" | "Medium Fit" | "Low Fit" | "Not Available";
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  if (score === null || score === undefined) {
    return {
      label: "Not Available",
      colorClass: "text-slate-400",
      bgClass: "bg-slate-500/10",
      borderClass: "border-slate-500/20",
    };
  }

  if (score >= 80) {
    return {
      label: "High Fit",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
    };
  }

  if (score >= 60) {
    return {
      label: "Medium Fit",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/20",
    };
  }

  return {
    label: "Low Fit",
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
  };
}

export function exportLeadsToCSV(leads: any[], filename = "enriched-leads.csv") {
  if (!leads || leads.length === 0) return;

  const headers = [
    "ID",
    "Company Name",
    "Domain",
    "Website",
    "Industry",
    "Company Size",
    "Location",
    "Business Model",
    "Score",
    "Fit",
    "Technologies",
    "Created At",
  ];

  const rows = leads.map((lead) => [
    `"${lead.id || ""}"`,
    `"${(lead.company_name || "").replace(/"/g, '""')}"`,
    `"${lead.domain || ""}"`,
    `"${lead.website || ""}"`,
    `"${lead.industry || ""}"`,
    `"${lead.company_size || ""}"`,
    `"${lead.location || ""}"`,
    `"${lead.business_model || ""}"`,
    lead.score ?? "",
    `"${lead.fit || ""}"`,
    `"${(lead.technologies || []).join("; ").replace(/"/g, '""')}"`,
    `"${lead.created_at || ""}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeadsToJSON(leads: any[], filename = "enriched-leads.json") {
  if (!leads || leads.length === 0) return;
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonStr);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

