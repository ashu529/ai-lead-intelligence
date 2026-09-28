import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Lead } from "@/lib/types/lead";
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Building2,
  Briefcase,
  Users,
  MapPin,
  Target,
  Package,
  Cpu,
  TrendingUp,
  Newspaper,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const revalidate = 0;

interface LeadDetailPageProps {
  params: {
    id: string;
  };
}

function getFitClass(score: number | null | undefined, fit?: string | null) {
  if (fit === "High Fit" || (score != null && score >= 80)) return "high";
  if (fit === "Medium Fit" || (score != null && score >= 60 && score < 80))
    return "medium";
  return "low";
}

function getFitLabel(score: number | null | undefined, fit?: string | null) {
  if (fit) return fit;
  if (score == null) return "Unknown";
  if (score >= 80) return "High Fit";
  if (score >= 60) return "Medium Fit";
  return "Low Fit";
}

function parseTargetCustomers(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          const pgItems = trimmed
            .slice(1, -1)
            .split(",")
            .map((s) => s.replace(/^"|"$/g, "").trim())
            .filter(Boolean);
          if (pgItems.length > 0) return pgItems;
        }
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {}
    }
    return trimmed
      .split(/[,;\n]+/)
      .map((item) => item.replace(/^[\[\]"'{}\s]+|[\[\]"'{}\s]+$/g, "").trim())
      .filter(Boolean);
  }
  return [String(input)];
}

function parseCriteriaArray(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {}
    }
    return trimmed
      .split(/[,;\n]+/)
      .map((s) => s.replace(/^[\[\]"'{}\s]+|[\[\]"'{}\s]+$/g, "").trim())
      .filter(Boolean);
  }
  return [String(input)];
}

function getCriteriaBreakdown(lead: Lead) {
  const rawBreakdown = lead.breakdown || {};
  const reasonsList = parseCriteriaArray(lead.reasons);
  const rawMatched = parseCriteriaArray(lead.matched_criteria);
  const rawMissing = parseCriteriaArray(lead.missing_criteria);

  const standardCategories = [
    { id: "industry", label: "Industry", keys: ["industry"] },
    { id: "company_size", label: "Company Size", keys: ["company_size", "companySize", "size"] },
    { id: "technology", label: "Technology", keys: ["technology", "technologies", "tech"] },
    { id: "growth", label: "Growth", keys: ["growth", "growth_signals", "growthSignals"] },
    { id: "business_model", label: "Business Model", keys: ["business_model", "businessModel", "model"] },
    { id: "geography", label: "Geography", keys: ["geography", "location", "geo"] },
    { id: "revenue", label: "Revenue", keys: ["revenue"] },
  ];

  const matchedMap = new Map<string, { label: string; detail?: string }>();
  const missingMap = new Map<string, { label: string; detail?: string }>();

  // 1. Process breakdown scores if rawBreakdown is present
  if (rawBreakdown && Object.keys(rawBreakdown).length > 0) {
    standardCategories.forEach((cat) => {
      let val: number | null | undefined = undefined;
      for (const k of cat.keys) {
        if (k in rawBreakdown) {
          const rawVal = (rawBreakdown as any)[k];
          if (typeof rawVal === "number") {
            val = rawVal;
            break;
          }
        }
      }

      // Check for matching reason string for detail
      const matchingReason = reasonsList.find((r) => {
        const lowerR = r.toLowerCase();
        const lowerId = cat.id.toLowerCase().replace(/_/g, "");
        const lowerLabel = cat.label.toLowerCase();
        return lowerR.includes(lowerId) || lowerR.includes(lowerLabel);
      });

      if (val !== undefined) {
        if (val > 0) {
          matchedMap.set(cat.id, {
            label: cat.label,
            detail: matchingReason,
          });
        } else {
          missingMap.set(cat.id, {
            label: cat.label,
            detail: matchingReason,
          });
        }
      }
    });
  }

  // 2. Incorporate explicit matched_criteria / missing_criteria if populated
  if (rawMatched.length > 0) {
    rawMatched.forEach((item) => {
      const lowerItem = item.toLowerCase();
      const matchedCat = standardCategories.find(
        (c) => lowerItem.includes(c.id.replace(/_/g, "")) || lowerItem.includes(c.label.toLowerCase())
      );
      if (matchedCat) {
        matchedMap.set(matchedCat.id, { label: matchedCat.label, detail: item });
        missingMap.delete(matchedCat.id);
      } else {
        matchedMap.set(item, { label: item });
      }
    });
  }

  if (rawMissing.length > 0) {
    rawMissing.forEach((item) => {
      const lowerItem = item.toLowerCase();
      const missingCat = standardCategories.find(
        (c) => lowerItem.includes(c.id.replace(/_/g, "")) || lowerItem.includes(c.label.toLowerCase())
      );
      if (missingCat && !matchedMap.has(missingCat.id)) {
        missingMap.set(missingCat.id, { label: missingCat.label, detail: item });
      } else if (!missingCat) {
        missingMap.set(item, { label: item });
      }
    });
  }

  // 3. Fallback to reasonsList if breakdown was missing
  if (matchedMap.size === 0 && missingMap.size === 0 && reasonsList.length > 0) {
    reasonsList.forEach((r) => {
      const lowerR = r.toLowerCase();
      const isNegative =
        lowerR.includes("mismatch") ||
        lowerR.includes("missing") ||
        lowerR.includes("unavailable") ||
        lowerR.includes("not available") ||
        lowerR.includes("0 /");

      const matchedCat = standardCategories.find(
        (c) => lowerR.includes(c.id.replace(/_/g, "")) || lowerR.includes(c.label.toLowerCase())
      );

      if (matchedCat) {
        if (isNegative) {
          missingMap.set(matchedCat.id, { label: matchedCat.label, detail: r });
        } else {
          matchedMap.set(matchedCat.id, { label: matchedCat.label, detail: r });
        }
      } else {
        if (isNegative) {
          missingMap.set(r, { label: r });
        } else {
          matchedMap.set(r, { label: r });
        }
      }
    });
  }

  // 4. Ensure all standard categories not matched are marked missing
  standardCategories.forEach((cat) => {
    if (!matchedMap.has(cat.id) && !missingMap.has(cat.id)) {
      missingMap.set(cat.id, { label: cat.label });
    }
  });

  return {
    matched: Array.from(matchedMap.values()),
    missing: Array.from(missingMap.values()),
  };
}

const AVATAR_COLORS: Record<string, string> = {
  A: "#e11d48", B: "#7c3aed", C: "#0891b2", D: "#059669", E: "#d97706",
  F: "#dc2626", G: "#16a34a", H: "#7c3aed", I: "#2563eb", J: "#db2777",
  K: "#0d9488", L: "#ea580c", M: "#7c3aed", N: "#16a34a", O: "#2563eb",
  P: "#e11d48", Q: "#0891b2", R: "#059669", S: "#4f46e5", T: "#d97706",
  U: "#db2777", V: "#0d9488", W: "#dc2626", X: "#7c3aed", Y: "#ea580c",
  Z: "#16a34a",
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const leadId = params.id;
  const lead = await getLeadById(leadId);

  if (!lead) notFound();

  const companyName = lead.company_name || "Unknown Company";
  const domain = lead.domain || "—";
  const description = lead.description || null;
  const fitClass = getFitClass(lead.score, lead.fit);
  const fitLabel = getFitLabel(lead.score, lead.fit);
  const avatarColor =
    AVATAR_COLORS[companyName.charAt(0).toUpperCase()] || "#4f46e5";

  const hasTech = lead.technologies && lead.technologies.length > 0;
  const hasNews = lead.news && lead.news.length > 0;
  const hasGrowth = lead.growth_signals && lead.growth_signals.length > 0;
  const hasProducts = lead.products_services && lead.products_services.length > 0;

  const targetCustomerChips = parseTargetCustomers(lead.target_customers);
  const reasonsList = parseCriteriaArray(lead.reasons);
  const { matched: matchedList, missing: missingList } = getCriteriaBreakdown(lead);

  // Normalize breakdown so revenue is always present
  const rawBreakdown = lead.breakdown || {};
  const breakdownData: Record<string, number | null | undefined> = {
    industry: rawBreakdown.industry ?? 0,
    company_size: rawBreakdown.company_size ?? 0,
    geography: rawBreakdown.geography ?? 0,
    revenue: rawBreakdown.revenue ?? 0,
    technology: rawBreakdown.technology ?? 0,
    growth: rawBreakdown.growth ?? 0,
    business_model: rawBreakdown.business_model ?? 0,
    ...rawBreakdown,
  };
  const breakdownEntries = Object.entries(breakdownData);

  const fitColors = {
    high: { fg: "var(--score-high)", bg: "var(--score-high-bg)", border: "var(--score-high-border)" },
    medium: { fg: "var(--score-med)", bg: "var(--score-med-bg)", border: "var(--score-med-border)" },
    low: { fg: "var(--score-low)", bg: "var(--score-low-bg)", border: "var(--score-low-border)" },
  };
  const fitColor = fitColors[fitClass];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 48px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} />
          Account Directory
          <ChevronRight size={12} style={{ opacity: 0.5 }} />
          <span style={{ color: "var(--text-secondary)" }}>{companyName}</span>
        </Link>
      </div>

      {/* Company Header */}
      <div
        className="card"
        style={{ padding: 24, marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              {companyName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-main)",
                  borderRadius: 4,
                  padding: "1px 8px",
                  fontWeight: 500,
                }}
              >
                {domain}
              </span>
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  <Globe size={12} />
                  Visit Website
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            {description && (
              <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 580, marginBottom: 0 }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Score Badge */}
        <div
          style={{
            background: fitColor.bg,
            border: `1px solid ${fitColor.border}`,
            borderRadius: 12,
            padding: "16px 20px",
            textAlign: "center",
            flexShrink: 0,
            minWidth: 110,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: fitColor.fg, marginBottom: 4 }}>
            ICP Score
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: fitColor.fg, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {lead.score ?? "—"}
          </div>
          <div style={{ fontSize: 11, color: fitColor.fg, opacity: 0.7, marginBottom: 8 }}>/100</div>
          <span
            className={`fit-badge ${fitClass}`}
            style={{ fontSize: 11 }}
          >
            {fitLabel}
          </span>
        </div>
      </div>

      {/* Two-column content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Company Overview */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={13} />
            Company Overview
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Standard overview fields */}
            {[
              { icon: Building2, label: "Industry", value: lead.industry },
              { icon: Briefcase, label: "Business Model", value: lead.business_model },
              { icon: Users, label: "Company Size", value: lead.company_size },
              { icon: MapPin, label: "Location", value: lead.location },
              {
                icon: ShieldCheck,
                label: "AI Confidence",
                value:
                  lead.confidence != null
                    ? `${Math.round(lead.confidence * 100)}%`
                    : null,
              },
            ]
              .filter((f) => f.value)
              .map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon size={13} style={{ color: "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: 1 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}

            {/* Target Customers (Rendered as Chips) */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Target size={13} style={{ color: "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: 4 }}>
                  Target Customers
                </div>
                {targetCustomerChips.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {targetCustomerChips.map((chip, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "#10202d",
                          color: "#60a5fa",
                          border: "1px solid #1d3b5a",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", fontStyle: "italic" }}>
                    Not specified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ICP Score Breakdown */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Target size={13} />
            Signal Assessment Breakdown
          </div>
          {breakdownEntries.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {breakdownEntries.map(([key, val]) => {
                const isRevenue = key.toLowerCase() === "revenue";
                const rawNumVal = typeof val === "number" ? val : 0;
                // Keep actual revenue score as 0 internally
                const numVal = isRevenue ? 0 : rawNumVal;
                const maxVal = isRevenue || key === "industry" ? 30 : 20;
                const pct = Math.min((numVal / maxVal) * 100, 100);

                const isRevenueMissing = isRevenue && rawNumVal === 0;

                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                        {key.replace(/_/g, " ")}
                      </span>
                      {isRevenueMissing ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>
                          Not available
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                          {numVal}
                        </span>
                      )}
                    </div>
                    <div className="breakdown-bar">
                      <div className="breakdown-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid var(--border-main)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Total Score</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: fitColor.fg }}>{lead.score ?? "—"}/100</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
              No breakdown data available.
            </p>
          )}
        </div>
      </div>

      {/* ICP Match & Gap Analysis */}
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", justifyBetween: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} className="text-[#00e599]" />
            <span>ICP Match & Gap Analysis</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Matched Criteria */}
          <div style={{ background: "#061f15", border: "1px solid rgba(0, 229, 153, 0.25)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#00e599", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle2 size={14} className="text-[#00e599]" />
                <span>Matching Criteria</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#042a1d", color: "#00e599", border: "1px solid rgba(0, 229, 153, 0.4)" }}>
                {matchedList.length} Matched
              </span>
            </div>

            {matchedList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {matchedList.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#c2d1cb", display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
                    <span style={{ color: "#00e599", fontWeight: 800, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                No explicit matching criteria recorded.
              </p>
            )}
          </div>

          {/* Missing / Unverified Criteria */}
          <div style={{ background: "#210f0a", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <AlertCircle size={14} className="text-[#f59e0b]" />
                <span>Missing & Unverified Criteria</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#291e05", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
                {missingList.length} Missing / Unverified
              </span>
            </div>

            {missingList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {missingList.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#c2d1cb", display: "flex", alignItems: "flex-start", gap: 7, lineHeight: 1.4 }}>
                    <span style={{ color: "#f59e0b", fontWeight: 800, marginTop: 1, flexShrink: 0 }}>✗</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                All evaluated ICP criteria passed with no identified gaps.
              </p>
            )}
          </div>
        </div>

        {/* AI Evaluation Notes / Reasons */}
        {reasonsList.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-main)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Sparkles size={12} className="text-[#00e599]" />
              <span>AI Evaluation Logic & Notes</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {reasonsList.map((r, i) => (
                <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: "#00e599", flexShrink: 0, fontWeight: 800 }}>·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Technologies & Products */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Tech Stack */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Cpu size={13} />
            Detected Technologies
          </div>
          {hasTech ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {lead.technologies!.map((t, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#042a1d",
                    color: "#00e599",
                    border: "1px solid rgba(0,229,153,0.3)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
              No technologies detected.
            </p>
          )}
        </div>

        {/* Products & Services */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Package size={13} />
            Products & Services
          </div>
          {hasProducts ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {lead.products_services!.map((p, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 9px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "#10202d",
                    color: "#60a5fa",
                    border: "1px solid #1d3b5a",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
              No products or services identified.
            </p>
          )}
        </div>
      </div>

      {/* Growth Signals & News */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Growth Signals */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={13} />
            Growth Signals
          </div>
          {hasGrowth ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {lead.growth_signals!.map((s, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: 8,
                    padding: "6px 10px",
                    background: "var(--score-med-bg)",
                    border: "1px solid var(--score-med-border)",
                    borderRadius: 6,
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--score-med)", flexShrink: 0 }}>▲</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
              No growth signals detected.
            </p>
          )}
        </div>

        {/* Recent News */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Newspaper size={13} />
            Recent News
          </div>
          {hasNews ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lead.news!.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    background: "var(--bg-main)",
                    border: "1px solid var(--border-main)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 3 }}>
                    {item.title}
                  </div>
                  {item.published_at && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                      {formatDate(item.published_at)}
                    </div>
                  )}
                  {item.description && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
              No recent news found.
            </p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div style={{ marginTop: 20, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
        <span>Enriched: {formatDate(lead.created_at)}</span>
        {lead.id && (
          <>
            <span>·</span>
            <span>ID: {lead.id}</span>
          </>
        )}
      </div>
    </div>
  );
}
