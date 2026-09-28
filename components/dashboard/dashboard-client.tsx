"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/types/lead";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  ExternalLink,
  Plus,
  X,
  ChevronRight,
  Globe,
  MapPin,
  Building2,
  Database,
  Target,
  Hexagon,
  Link2,
  Zap,
  Quote,
  MoreHorizontal,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  Eye,
} from "lucide-react";
import { ExportButton } from "@/components/dashboard/export-button";

interface DashboardClientProps {
  leads: Lead[];
}

function getFitClass(score: number | null | undefined, fit?: string | null) {
  if (fit === "High Fit" || (score !== null && score !== undefined && score >= 80))
    return "high";
  if (
    fit === "Medium Fit" ||
    (score !== null && score !== undefined && score >= 60 && score < 80)
  )
    return "medium";
  if (fit === "Low Fit" || (score !== null && score !== undefined && score < 60))
    return "low";
  return "none";
}

function getFitLabel(score: number | null | undefined, fit?: string | null) {
  if (fit) return fit;
  if (score === null || score === undefined) return "Not Scored";
  if (score >= 80) return "High Fit";
  if (score >= 60) return "Medium Fit";
  return "Low Fit";
}

export function DashboardClient({ leads = [] }: DashboardClientProps) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fitFilter, setFitFilter] = useState<string>("all");

  // Computed Real Metrics
  const totalEvaluated = leads.length;
  const highFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "high").length;
  const medFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "medium").length;
  const lowFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "low").length;

  const highPct = totalEvaluated > 0 ? Math.round((highFitCount / totalEvaluated) * 100) : 0;
  const medPct = totalEvaluated > 0 ? Math.round((medFitCount / totalEvaluated) * 100) : 0;
  const lowPct = totalEvaluated > 0 ? Math.round((lowFitCount / totalEvaluated) * 100) : 0;

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (l.company_name && l.company_name.toLowerCase().includes(q)) ||
        (l.domain && l.domain.toLowerCase().includes(q)) ||
        (l.industry && l.industry.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q));

      const fitCat = getFitClass(l.score, l.fit);
      const matchFit = fitFilter === "all" || fitCat === fitFilter;

      return matchSearch && matchFit;
    });
  }, [leads, searchQuery, fitFilter]);

  // Dynamic Score Ranges Distribution
  const scoreRanges = useMemo(() => {
    const buckets = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };
    leads.forEach((l) => {
      const s = l.score;
      if (s === null || s === undefined) return;
      if (s <= 20) buckets["0-20"]++;
      else if (s <= 40) buckets["21-40"]++;
      else if (s <= 60) buckets["41-60"]++;
      else if (s <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });
    return buckets;
  }, [leads]);

  const maxBucketCount = Math.max(1, ...Object.values(scoreRanges));

  // Dynamic Industry Breakdown
  const industryStats = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      const ind = l.industry && l.industry.trim() ? l.industry.trim() : "Unspecified";
      map[ind] = (map[ind] || 0) + 1;
    });
    const total = leads.length;
    const colors = ["#00e599", "#00b8d4", "#f59e0b", "#a78bfa", "#f43f5e", "#38bdf8"];
    return Object.entries(map)
      .map(([name, count], i) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Dynamic Recent Activity derived strictly from real Supabase leads
  const recentActivities = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    const sorted = [...leads].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
    return sorted.slice(0, 5);
  }, [leads]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ─── Hero Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#00e599] uppercase mb-1 flex items-center gap-1.5">
            DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            From data to <span className="text-[#00e599]">opportunities</span>
          </h1>
          <p className="text-xs text-[#8a9e96] mt-1 font-medium max-w-xl">
            Discover and qualify high-value companies with AI-powered enrichment and ICP scoring.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Top Right Mini Graphic Banner */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0d1712] border border-[#172b20] relative overflow-hidden">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                Smarter research.
                <ArrowUpRight size={14} className="text-[#00e599]" />
              </div>
              <div className="text-[11px] font-semibold text-[#00e599]">
                Stronger pipeline.
              </div>
            </div>
            {/* Mountain SVG Line */}
            <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-[#00e599]/30">
              <path d="M0 28 L16 18 L32 24 L48 10 L64 4" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M0 28 L16 18 L32 24 L48 10 L64 4 L64 32 L0 32 Z" fill="currentColor" fillOpacity="0.1" />
            </svg>
          </div>

          <Link
            href="/leads/new"
            className="flex items-center gap-1.5 bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,153,0.25)]"
          >
            <Plus size={14} strokeWidth={3} />
            Enrich Lead
          </Link>
        </div>
      </div>

      {/* ─── 4 Metric / KPI Cards (100% Real Data) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluated */}
        <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between shadow-xs hover:border-[#00e599]/40 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#052b1e] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
                <Database size={16} />
              </div>
              <span className="text-[11px] font-semibold text-[#8ba298]">Total Evaluated</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{totalEvaluated}</div>
            <div className="text-[11px] font-semibold text-[#00e599]">
              Real-time database count
            </div>
          </div>
          <div className="flex items-end gap-1 h-9">
            <div className="w-1.5 h-3 bg-[#00e599]/30 rounded-xs" />
            <div className="w-1.5 h-4 bg-[#00e599]/40 rounded-xs" />
            <div className="w-1.5 h-6 bg-[#00e599]/60 rounded-xs" />
            <div className="w-1.5 h-8 bg-[#00e599] rounded-xs shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
          </div>
        </div>

        {/* Card 2: High Fit */}
        <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between shadow-xs hover:border-[#00e599]/40 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#052b1e] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
                <Target size={16} />
              </div>
              <span className="text-[11px] font-semibold text-[#8ba298]">High Fit (80–100)</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{highFitCount}</div>
            <div className="text-[11px] font-semibold text-[#00e599]">
              {highPct}% of total
            </div>
          </div>
          <div className="flex items-end gap-1 h-9">
            <div className="w-1.5 h-4 bg-[#00e599]/30 rounded-xs" />
            <div className="w-1.5 h-7 bg-[#00e599]/60 rounded-xs" />
            <div className="w-1.5 h-9 bg-[#00e599] rounded-xs shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
          </div>
        </div>

        {/* Card 3: Medium Fit */}
        <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between shadow-xs hover:border-[#f59e0b]/40 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#261a04] border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                <Hexagon size={16} />
              </div>
              <span className="text-[11px] font-semibold text-[#8ba298]">Medium Fit (60–79)</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{medFitCount}</div>
            <div className="text-[11px] font-semibold text-[#f59e0b]">
              {medPct}% of total
            </div>
          </div>
          <div className="flex items-end gap-1 h-9">
            <div className="w-1.5 h-3 bg-[#f59e0b]/30 rounded-xs" />
            <div className="w-1.5 h-5 bg-[#f59e0b]/50 rounded-xs" />
            <div className="w-1.5 h-8 bg-[#f59e0b] rounded-xs shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
        </div>

        {/* Card 4: Low Fit */}
        <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between shadow-xs hover:border-[#ef4444]/40 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#25080a] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
                <Link2 size={16} />
              </div>
              <span className="text-[11px] font-semibold text-[#8ba298]">Low Fit (0–59)</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{lowFitCount}</div>
            <div className="text-[11px] font-semibold text-[#f87171]">
              {lowPct}% of total
            </div>
          </div>
          <div className="flex items-end gap-1 h-9">
            <div className="w-1.5 h-2 bg-[#ef4444]/30 rounded-xs" />
            <div className="w-1.5 h-6 bg-[#ef4444]/60 rounded-xs" />
            <div className="w-1.5 h-9 bg-[#ef4444] rounded-xs shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          </div>
        </div>
      </div>

      {/* ─── Middle Charts Section (Dynamic Distribution, Breakdown, Activity) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Fit Distribution Chart (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0d1511] border border-[#15271f] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Lead Fit Distribution</h3>
              <p className="text-[11px] text-[#647a70] mt-0.5">Real distribution by ICP score range</p>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-44 flex items-end justify-between px-4 pb-2 border-b border-[#14241c] relative">
            {/* Grid lines */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-15">
              <div className="border-b border-[#00e599] w-full" />
              <div className="border-b border-[#00e599] w-full" />
              <div className="border-b border-[#00e599] w-full" />
              <div className="border-b border-[#00e599] w-full" />
            </div>

            {/* Y axis numbers */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-[#5e756b] font-mono">
              <span>{maxBucketCount}</span>
              <span>{Math.round(maxBucketCount * 0.66)}</span>
              <span>{Math.round(maxBucketCount * 0.33)}</span>
              <span>0</span>
            </div>

            {/* Dynamic Bars */}
            <div className="w-full flex items-end justify-around pl-6 h-full">
              {(
                [
                  { range: "0-20", count: scoreRanges["0-20"], color: "#ef4444", textCol: "#f87171" },
                  { range: "21-40", count: scoreRanges["21-40"], color: "#f97316", textCol: "#fb923c" },
                  { range: "41-60", count: scoreRanges["41-60"], color: "#f59e0b", textCol: "#fbbf24" },
                  { range: "61-80", count: scoreRanges["61-80"], color: "#eab308", textCol: "#fde047" },
                  { range: "81-100", count: scoreRanges["81-100"], color: "#00e599", textCol: "#00e599" },
                ] as const
              ).map((b) => {
                const heightPct = maxBucketCount > 0 ? Math.max(4, (b.count / maxBucketCount) * 100) : 4;
                return (
                  <div key={b.range} className="flex flex-col items-center gap-1 group relative h-full justify-end">
                    {b.count > 0 && (
                      <span className="text-[10px] font-bold" style={{ color: b.textCol }}>
                        {b.count}
                      </span>
                    )}
                    <div
                      className="w-7 rounded-t-sm transition-all duration-300 relative"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: b.count > 0 ? b.color : "#14241c",
                        boxShadow: b.count > 0 ? `0 0 10px ${b.color}40` : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis labels */}
          <div className="flex items-center justify-around pl-6 text-[10px] font-semibold text-[#647a70]">
            <span>0–20</span>
            <span>21–40</span>
            <span>41–60</span>
            <span>61–80</span>
            <span>81–100</span>
          </div>
        </div>

        {/* Center Column: Industry Breakdown (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[#0d1511] border border-[#15271f] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Industry Breakdown</h3>
            <span className="text-[11px] font-semibold text-[#647a70]">
              {industryStats.length} Industries
            </span>
          </div>

          {/* Donut Chart SVG */}
          <div className="flex items-center justify-center py-2 relative">
            <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
              {industryStats.length === 0 ? (
                <circle cx="65" cy="65" r="46" stroke="#14241c" strokeWidth="14" fill="transparent" />
              ) : (
                industryStats.slice(0, 4).map((ind, i) => {
                  const circumference = 289;
                  const strokeDash = (ind.percentage / 100) * circumference;
                  let offset = 0;
                  for (let j = 0; j < i; j++) {
                    offset += (industryStats[j].percentage / 100) * circumference;
                  }
                  return (
                    <circle
                      key={ind.name}
                      cx="65"
                      cy="65"
                      r="46"
                      stroke={ind.color}
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );
                })
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-white">{totalEvaluated}</span>
              <span className="text-[10px] font-semibold text-[#647a70]">Companies</span>
            </div>
          </div>

          {/* Dynamic Legend */}
          <div className="space-y-2 pt-2 border-t border-[#14241c] max-h-24 overflow-y-auto">
            {industryStats.length === 0 ? (
              <p className="text-xs text-[#5e756b] italic text-center">No industry data available.</p>
            ) : (
              industryStats.slice(0, 4).map((ind) => (
                <div key={ind.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[140px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ind.color }} />
                    <span className="font-semibold text-white truncate">{ind.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8ba298] font-semibold">
                    <span>{ind.count}</span>
                    <span>{ind.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Recent Activity (3 Cols) */}
        <div className="lg:col-span-3 p-5 rounded-xl bg-[#0d1511] border border-[#15271f] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity size={14} className="text-[#00e599]" />
              Recent Activity
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-hidden">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5e756b] italic">
                No recent activity recorded.
              </div>
            ) : (
              recentActivities.map((lead) => {
                const fitCat = getFitClass(lead.score, lead.fit);
                const fitLabel = getFitLabel(lead.score, lead.fit);
                const name = lead.company_name || lead.domain || "Unknown";
                const initial = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={lead.id}
                    onClick={() => router.push(`/leads/${encodeURIComponent(lead.id || lead.domain || "")}`)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#121c17] transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#042a1d] border border-[#00e599]/30 flex items-center justify-center text-[#00e599] shrink-0 font-extrabold text-xs">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-[#00e599] transition-colors">
                        {name} enriched
                      </div>
                      <div className="text-[10px] text-[#647a70] truncate">
                        Score: {lead.score ?? "Not Scored"} ({fitLabel})
                      </div>
                    </div>
                    <span className="text-[10px] text-[#5e756b] shrink-0">
                      {formatDate(lead.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Recent Leads Table + Action Cards ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Leads Table (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[#0d1511] border border-[#15271f] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Leads</h3>
              <p className="text-[11px] text-[#647a70]">Real database records evaluated against ICP</p>
            </div>

            {/* Table Search & Fit Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5e756b]" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-white placeholder:text-[#5e756b] focus:outline-none focus:border-[#00e599] w-36 sm:w-44"
                />
              </div>

              <select
                value={fitFilter}
                onChange={(e) => setFitFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-[#8ba298] font-semibold focus:outline-none focus:border-[#00e599] cursor-pointer"
              >
                <option value="all">All Fits</option>
                <option value="high">High Fit</option>
                <option value="medium">Medium Fit</option>
                <option value="low">Low Fit</option>
              </select>

              {selectedIds.length > 0 && (
                <ExportButton leads={leads.filter((l) => selectedIds.includes(l.id))} />
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#14241c]">
            <table className="leads-table">
              <thead>
                <tr>
                  <th className="w-8 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-[#1e382c] bg-[#070d0a] accent-[#00e599] cursor-pointer"
                      onChange={handleSelectAll}
                      checked={
                        filteredLeads.length > 0 && selectedIds.length === filteredLeads.length
                      }
                    />
                  </th>
                  <th>COMPANY</th>
                  <th>DOMAIN</th>
                  <th>INDUSTRY</th>
                  <th>LOCATION</th>
                  <th>ICP SCORE</th>
                  <th>FIT STATUS</th>
                  <th>ENRICHED</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-[#647a70]">
                      No matching leads found.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedIds.includes(lead.id);
                    const fitCat = getFitClass(lead.score, lead.fit);
                    const fitLabel = getFitLabel(lead.score, lead.fit);
                    const name = lead.company_name || lead.domain || "Unknown";
                    const initial = name.charAt(0).toUpperCase();

                    return (
                      <tr
                        key={lead.id}
                        className={isSelected ? "row-selected" : ""}
                        onClick={() => router.push(`/leads/${encodeURIComponent(lead.id || lead.domain || "")}`)}
                      >
                        <td
                          className="text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(lead.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-[#1e382c] bg-[#070d0a] accent-[#00e599] cursor-pointer"
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded bg-[#042a1d] border border-[#00e599]/40 flex items-center justify-center text-[#00e599] font-bold text-xs shrink-0">
                              {initial}
                            </div>
                            <span className="font-bold text-white text-xs hover:text-[#00e599] transition-colors">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td>
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-[#8ba298] hover:text-[#00e599] flex items-center gap-1 font-medium"
                            >
                              {lead.domain || "website.com"}
                              <ExternalLink size={10} className="opacity-70" />
                            </a>
                          ) : (
                            <span className="text-xs text-[#5e756b]">{lead.domain || "—"}</span>
                          )}
                        </td>
                        <td>
                          {lead.industry && lead.industry.trim() ? (
                            <span className="inline-flex px-2 py-0.5 rounded bg-[#10202d] text-[#60a5fa] border border-[#1d3b5a] text-[11px] font-semibold">
                              {lead.industry}
                            </span>
                          ) : (
                            <span className="text-xs text-[#5e756b]">Not available</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-[#8ba298]">
                            <MapPin size={11} className="text-[#5e756b]" />
                            <span>{lead.location && lead.location.trim() ? lead.location : "—"}</span>
                          </div>
                        </td>
                        <td>
                          {lead.score !== null && lead.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  fitCat === "high"
                                    ? "text-[#00e599]"
                                    : fitCat === "medium"
                                    ? "text-[#f59e0b]"
                                    : "text-[#f87171]"
                                }`}
                              >
                                {lead.score}
                              </span>
                              <div className="w-14 h-1.5 rounded-full bg-[#14241c] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    fitCat === "high"
                                      ? "bg-[#00e599]"
                                      : fitCat === "medium"
                                      ? "bg-[#f59e0b]"
                                      : "bg-[#ef4444]"
                                  }`}
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#5e756b] font-medium">Not available</span>
                          )}
                        </td>
                        <td>
                          {fitCat !== "none" ? (
                            <span className={`fit-badge ${fitCat}`}>
                              <span className="w-1.5 h-1.5 rounded-full fill-current" />
                              {fitLabel}
                            </span>
                          ) : (
                            <span className="text-xs text-[#5e756b]">Not Scored</span>
                          )}
                        </td>
                        <td>
                          <span className="text-xs text-[#8ba298]">
                            {formatDate(lead.created_at)}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Quick Drawer View"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                              }}
                              className="p-1 rounded text-[#647a70] hover:text-[#00e599] hover:bg-[#14241c] transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              title="View Full Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/leads/${encodeURIComponent(lead.id || lead.domain || "")}`);
                              }}
                              className="p-1 rounded text-[#647a70] hover:text-white hover:bg-[#14241c] transition-colors"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Column (Promo & Quotes) (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Action Card: Enrich New Account */}
          <div className="p-5 rounded-xl bg-[#0d1511] border border-[#15271f] relative overflow-hidden space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#052b1e] border border-[#00e599]/40 flex items-center justify-center text-[#00e599]">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Qualify New Leads</h3>
              <p className="text-xs text-[#8ba298] mt-1 leading-relaxed">
                Run AI signal extraction and ICP scoring on any company website or batch CSV file.
              </p>
            </div>
            <Link
              href="/leads/new"
              className="inline-flex items-center gap-1.5 bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-[0_0_14px_rgba(0,229,153,0.25)]"
            >
              Enrich Account <ChevronRight size={14} />
            </Link>
            {/* Background vector wave graphic */}
            <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="absolute right-0 bottom-0 text-[#00e599]/10 pointer-events-none">
              <path d="M0 50 Q 35 20, 70 40 T 140 10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M0 60 Q 35 30, 70 50 T 140 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* Banner: Batch CSV Enrichment */}
          <div className="p-4 rounded-xl bg-[#081710] border border-[#00e599]/30 flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00e599]/20 border border-[#00e599]/40 flex items-center justify-center text-[#00e599] shrink-0">
                <Target size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Batch CSV Enrichment</h4>
                <p className="text-[10px] text-[#8ba298] mt-0.5">
                  Process bulk domains and evaluate criteria at scale.
                </p>
              </div>
            </div>
            <Link
              href="/leads/bulk"
              className="flex items-center gap-1 bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all shadow-[0_0_10px_rgba(0,229,153,0.3)]"
            >
              Batch CSV <ChevronRight size={13} />
            </Link>
          </div>

          {/* Quote Card */}
          <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-start gap-3">
            <Quote size={20} className="text-[#00e599] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs italic text-[#c2d1cb]">
                “Data turns uncertainty into opportunity.”
              </p>
              <span className="text-[10px] text-[#5e756b] block mt-1 font-semibold">— B2B Lead Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Drawer Modal for Quick Selected Lead Details ────────────────────────── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-[#0d1511] border-l border-[#172b20] h-full flex flex-col overflow-y-auto animate-fade-in p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#14241c] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00e599]/20 border border-[#00e599]/40 text-[#00e599] flex items-center justify-center font-extrabold text-base">
                  {(selectedLead.company_name || selectedLead.domain || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {selectedLead.company_name || selectedLead.domain}
                  </h2>
                  <a
                    href={selectedLead.website || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#00e599] flex items-center gap-1 hover:underline mt-0.5"
                  >
                    {selectedLead.domain} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-[#647a70] hover:text-white hover:bg-[#14241c]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score block */}
            <div className="p-4 rounded-xl bg-[#07120c] border border-[#14241c] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8ba298]">ICP Qualification Score</span>
                <span className={`fit-badge ${getFitClass(selectedLead.score, selectedLead.fit)}`}>
                  {getFitLabel(selectedLead.score, selectedLead.fit)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#00e599]">
                  {selectedLead.score !== null && selectedLead.score !== undefined ? selectedLead.score : "Not Scored"}
                </span>
                {selectedLead.score !== null && selectedLead.score !== undefined && (
                  <span className="text-xs text-[#647a70]">/ 100</span>
                )}
              </div>
              <div className="w-full h-2 rounded-full bg-[#14241c] overflow-hidden">
                <div
                  className="h-full bg-[#00e599] rounded-full"
                  style={{ width: `${selectedLead.score ?? 0}%` }}
                />
              </div>
            </div>

            {/* Description */}
            {selectedLead.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#8ba298] uppercase tracking-wider">Company Description</h4>
                <p className="text-xs text-[#c2d1cb] leading-relaxed">{selectedLead.description}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#09100c] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase">Industry</span>
                <p className="text-xs font-semibold text-white">
                  {selectedLead.industry && selectedLead.industry.trim() ? selectedLead.industry : "Not available"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#09100c] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase">Location</span>
                <p className="text-xs font-semibold text-white">
                  {selectedLead.location && selectedLead.location.trim() ? selectedLead.location : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#09100c] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase">Company Size</span>
                <p className="text-xs font-semibold text-white">
                  {selectedLead.company_size && selectedLead.company_size.trim() ? selectedLead.company_size : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#09100c] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase">Business Model</span>
                <p className="text-xs font-semibold text-white">
                  {selectedLead.business_model && selectedLead.business_model.trim() ? selectedLead.business_model : "—"}
                </p>
              </div>
            </div>

            {/* Target Customers */}
            {selectedLead.target_customers && (
              <div className="p-3 rounded-lg bg-[#09100c] border border-[#14241c] space-y-1.5">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase">Target Customers</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedLead.target_customers)
                    ? selectedLead.target_customers
                    : typeof selectedLead.target_customers === "string"
                    ? (selectedLead.target_customers.startsWith("[")
                        ? (JSON.parse(selectedLead.target_customers) as string[])
                        : selectedLead.target_customers.split(/[,;\n]+/))
                    : []
                  ).map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-[#10202d] text-[#60a5fa] border border-[#1d3b5a] text-[11px] font-semibold"
                    >
                      {String(item).replace(/^[\[\]"'{}\s]+|[\[\]"'{}\s]+$/g, "").trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action link */}
            <div className="pt-4 border-t border-[#14241c] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#8ba298] hover:bg-[#14241c]"
              >
                Close
              </button>
              <Link
                href={`/leads/${encodeURIComponent(selectedLead.id || selectedLead.domain)}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#00e599] text-[#03140e] text-xs font-bold hover:bg-[#00cc88]"
              >
                Full Analysis <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
