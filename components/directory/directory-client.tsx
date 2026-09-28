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
  ChevronRight,
  Globe,
  MapPin,
  Building2,
  Database,
  Target,
  Users,
  Eye,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { ExportButton } from "@/components/dashboard/export-button";

interface DirectoryClientProps {
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

export function DirectoryClient({ leads = [] }: DirectoryClientProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [fitFilter, setFitFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "score-desc" | "score-asc" | "name">("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Computed Real Metrics
  const totalCount = leads.length;
  const highFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "high").length;
  const medFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "medium").length;
  const lowFitCount = leads.filter((l) => getFitClass(l.score, l.fit) === "low").length;

  // Extract unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry && l.industry.trim()) set.add(l.industry.trim());
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (l.company_name && l.company_name.toLowerCase().includes(q)) ||
        (l.domain && l.domain.toLowerCase().includes(q)) ||
        (l.industry && l.industry.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q));

      const fitCat = getFitClass(l.score, l.fit);
      const matchFit = fitFilter === "all" || fitCat === fitFilter;

      const matchIndustry =
        industryFilter === "all" ||
        (l.industry && l.industry.trim().toLowerCase() === industryFilter.toLowerCase());

      return matchSearch && matchFit && matchIndustry;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      }
      if (sortBy === "oldest") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return da - db;
      }
      if (sortBy === "score-desc") {
        const sa = a.score ?? -1;
        const sb = b.score ?? -1;
        return sb - sa;
      }
      if (sortBy === "score-asc") {
        const sa = a.score ?? 999;
        const sb = b.score ?? 999;
        return sa - sb;
      }
      if (sortBy === "name") {
        const na = a.company_name || a.domain || "";
        const nb = b.company_name || b.domain || "";
        return na.localeCompare(nb);
      }
      return 0;
    });

    return result;
  }, [leads, searchQuery, fitFilter, industryFilter, sortBy]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setFitFilter("all");
    setIndustryFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#00e599] uppercase mb-1 flex items-center gap-1.5">
            ACCOUNT DIRECTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enriched <span className="text-[#00e599]">Company Directory</span>
          </h1>
          <p className="text-xs text-[#8a9e96] mt-1 font-medium max-w-xl">
            Explore, search, and filter all AI-enriched companies and qualified accounts stored in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <ExportButton leads={leads.filter((l) => selectedIds.includes(l.id))} />
          )}
          <Link
            href="/leads/new"
            className="flex items-center gap-1.5 bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,153,0.25)]"
          >
            <Plus size={15} strokeWidth={3} />
            Enrich Account
          </Link>
        </div>
      </div>

      {/* ─── Stats Strip Bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5e756b] uppercase block">Total Accounts</span>
            <span className="text-xl font-extrabold text-white">{totalCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#052b1e] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
            <Database size={15} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5e756b] uppercase block">High Fit (80–100)</span>
            <span className="text-xl font-extrabold text-[#00e599]">{highFitCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#052b1e] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
            <Target size={15} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5e756b] uppercase block">Medium Fit (60–79)</span>
            <span className="text-xl font-extrabold text-[#f59e0b]">{medFitCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#261a04] border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
            <Target size={15} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1511] border border-[#15271f] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5e756b] uppercase block">Low Fit (0–59)</span>
            <span className="text-xl font-extrabold text-[#f87171]">{lowFitCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#25080a] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
            <Target size={15} />
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Toolbar ─────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#0d1511] border border-[#15271f] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5e756b]" />
            <input
              type="text"
              placeholder="Search by company name, domain, industry, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-white placeholder:text-[#5e756b] focus:outline-none focus:border-[#00e599] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e756b] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Fit Filter Dropdown */}
            <select
              value={fitFilter}
              onChange={(e) => setFitFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-[#c2d1cb] font-semibold focus:outline-none focus:border-[#00e599] cursor-pointer"
            >
              <option value="all">All Qualification Fits</option>
              <option value="high">High Fit (80–100)</option>
              <option value="medium">Medium Fit (60–79)</option>
              <option value="low">Low Fit (0–59)</option>
              <option value="none">Not Scored</option>
            </select>

            {/* Industry Filter Dropdown */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-[#c2d1cb] font-semibold focus:outline-none focus:border-[#00e599] cursor-pointer max-w-[180px]"
            >
              <option value="all">All Industries</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#070d0a] border border-[#182a20] text-xs text-[#c2d1cb] font-semibold focus:outline-none focus:border-[#00e599] cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="score-desc">Sort: Highest Score</option>
              <option value="score-asc">Sort: Lowest Score</option>
              <option value="name">Sort: Company Name (A-Z)</option>
            </select>

            {(searchQuery || fitFilter !== "all" || industryFilter !== "all" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg bg-[#14241c] hover:bg-[#1e382c] text-[#8ba298] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count indicator */}
        <div className="flex items-center justify-between text-xs text-[#647a70] pt-1 border-t border-[#14241c]">
          <span>
            Showing <strong className="text-white">{filteredLeads.length}</strong> of{" "}
            <strong className="text-white">{totalCount}</strong> enriched accounts
          </span>
          {selectedIds.length > 0 && (
            <span className="text-[#00e599] font-semibold">
              {selectedIds.length} accounts selected
            </span>
          )}
        </div>
      </div>

      {/* ─── Directory Table ─────────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#0d1511] border border-[#15271f] space-y-4">
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
                <th>ENRICHED DATE</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#042a1d] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
                        <Search size={22} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">No enriched accounts found</h4>
                        <p className="text-xs text-[#8ba298]">
                          No company records matched your search query or selected fit filters.
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={clearFilters}
                          className="px-3.5 py-1.5 rounded-lg bg-[#14241c] hover:bg-[#1e382c] text-white text-xs font-semibold transition-colors"
                        >
                          Clear Filters
                        </button>
                        <Link
                          href="/leads/new"
                          className="px-3.5 py-1.5 rounded-lg bg-[#00e599] text-[#03140e] text-xs font-bold hover:bg-[#00cc88]"
                        >
                          Enrich New Lead
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const fitCat = getFitClass(lead.score, lead.fit);
                  const fitLabel = getFitLabel(lead.score, lead.fit);
                  const name = lead.company_name || lead.domain || "Unknown Company";
                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={lead.id}
                      className={isSelected ? "row-selected" : ""}
                      onClick={() =>
                        router.push(`/leads/${encodeURIComponent(lead.id || lead.domain || "")}`)
                      }
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#042a1d] border border-[#00e599]/40 flex items-center justify-center text-[#00e599] font-extrabold text-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs hover:text-[#00e599] transition-colors block">
                              {name}
                            </span>
                            {lead.company_size && (
                              <span className="text-[10px] text-[#5e756b] block">
                                {lead.company_size}
                              </span>
                            )}
                          </div>
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
                            className="p-1.5 rounded text-[#647a70] hover:text-[#00e599] hover:bg-[#14241c] transition-colors"
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
                            className="p-1.5 rounded text-[#647a70] hover:text-white hover:bg-[#14241c] transition-colors flex items-center gap-1 text-xs font-semibold"
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
                  {selectedLead.score !== null && selectedLead.score !== undefined
                    ? selectedLead.score
                    : "Not Scored"}
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
