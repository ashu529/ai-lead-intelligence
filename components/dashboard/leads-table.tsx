"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lead } from "@/lib/types/lead";
import { formatDate, formatFitScore } from "@/lib/utils";
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Building2,
  Globe,
  MapPin,
  Tag,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/dashboard/export-button";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fitFilter, setFitFilter] = useState<string>("ALL");
  const [industryFilter, setIndustryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "score">("newest");

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.industry && l.industry !== "Not available") {
        set.add(l.industry);
      }
    });
    return Array.from(set).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          (lead.company_name && lead.company_name.toLowerCase().includes(q)) ||
          (lead.domain && lead.domain.toLowerCase().includes(q)) ||
          (lead.industry && lead.industry.toLowerCase().includes(q));

        let matchesFit = true;
        if (fitFilter === "HIGH") {
          matchesFit = lead.fit === "High Fit" || (lead.score !== null && lead.score !== undefined && lead.score >= 80);
        } else if (fitFilter === "MEDIUM") {
          matchesFit =
            lead.fit === "Medium Fit" ||
            (lead.score !== null && lead.score !== undefined && lead.score >= 60 && lead.score < 80);
        } else if (fitFilter === "LOW") {
          matchesFit = lead.fit === "Low Fit" || (lead.score !== null && lead.score !== undefined && lead.score < 60);
        }

        let matchesIndustry = true;
        if (industryFilter !== "ALL") {
          matchesIndustry = lead.industry === industryFilter;
        }

        return matchesQuery && matchesFit && matchesIndustry;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.score ?? 0) - (a.score ?? 0);
        }
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [leads, searchQuery, fitFilter, industryFilter, sortBy]);

  return (
    <div className="space-y-3">
      {/* Search, Filter & Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-800 bg-slate-900/90 p-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search by company, domain, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fit Filter */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={fitFilter}
              onChange={(e) => setFitFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Fit Levels
              </option>
              <option value="HIGH" className="bg-slate-900 text-slate-200">
                High Fit (80+)
              </option>
              <option value="MEDIUM" className="bg-slate-900 text-slate-200">
                Medium Fit (60-79)
              </option>
              <option value="LOW" className="bg-slate-900 text-slate-200">
                Low Fit (0-59)
              </option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Industries
              </option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "score")}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">
                Newest First
              </option>
              <option value="score" className="bg-slate-900 text-slate-200">
                Highest Score
              </option>
            </select>
          </div>

          {/* Export */}
          <ExportButton leads={filteredLeads} />

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            title="Refresh lead data from Supabase"
            className="h-8 px-2.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Industry</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-center">ICP Score</th>
                <th className="px-5 py-3">Fit Status</th>
                <th className="px-5 py-3">Enriched</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building2 className="h-8 w-8 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">
                        No enriched leads found
                      </p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your search filters or enrich a new company.
                      </p>
                      <Link href="/leads/new" className="mt-2">
                        <Button size="sm">
                          <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                          Enrich New Lead
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const fitInfo = formatFitScore(lead.score);
                  const displayCompany = lead.company_name || lead.domain || "Not available";
                  const displayDomain = lead.domain || "Not available";
                  const displayIndustry = lead.industry || "Not available";
                  const displayLocation = lead.location || "Not available";
                  const targetId = lead.id || lead.domain || "";

                  return (
                    <tr
                      key={lead.id || lead.domain || Math.random()}
                      className="group hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      {/* Company Avatar & Name */}
                      <td className="px-5 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
                            {displayCompany.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[180px]">
                            {displayCompany}
                          </span>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-5 py-3.5 text-slate-300">
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-300 hover:text-indigo-400 transition-colors"
                          >
                            <Globe className="h-3.5 w-3.5 text-slate-500" />
                            <span>{displayDomain}</span>
                            <ExternalLink className="h-3 w-3 text-slate-500" />
                          </a>
                        ) : (
                          <span className="text-slate-400">{displayDomain}</span>
                        )}
                      </td>

                      {/* Industry */}
                      <td className="px-5 py-3.5 text-slate-300">
                        <span className="inline-flex items-center rounded-md bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300 border border-slate-700/50">
                          {displayIndustry}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{displayLocation}</span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-5 py-3.5 text-center font-bold">
                        <span className={fitInfo.colorClass}>
                          {lead.score !== null && lead.score !== undefined ? `${lead.score} / 100` : "N/A"}
                        </span>
                      </td>

                      {/* Fit Badge */}
                      <td className="px-5 py-3.5">
                        <Badge
                          className={`${fitInfo.bgClass} ${fitInfo.colorClass} ${fitInfo.borderClass}`}
                        >
                          {lead.fit || fitInfo.label}
                        </Badge>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/leads/${encodeURIComponent(targetId)}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs group-hover:border-indigo-500/50">
                            <span>View Profile</span>
                            <ChevronRight className="h-3.5 w-3.5 ml-1 text-slate-400 group-hover:text-indigo-400" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
