"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ICP_INDUSTRIES,
  ICP_COMPANY_SIZES,
  ICP_LOCATIONS,
  ICP_BUSINESS_MODELS,
  ICP_TECHNOLOGIES,
} from "@/lib/icp-options";
import { ICPConfig, Lead } from "@/lib/types/lead";
import { MultiSelect } from "@/components/icp/multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Globe,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronRight,
  Sparkles,
  Cpu,
  TrendingUp,
  Building2,
  Users,
  MapPin,
  Briefcase,
  ExternalLink,
  Plus,
  RotateCcw,
} from "lucide-react";

const PROGRESS_STAGES = [
  "Collecting company information...",
  "Analyzing technology signals...",
  "Analyzing company data with AI...",
  "Calculating ICP fit...",
  "Saving enriched lead...",
];

function getFitClass(score: number | null | undefined, fit?: string | null) {
  if (fit === "High Fit" || (score !== null && score !== undefined && score >= 80))
    return "high";
  if (
    fit === "Medium Fit" ||
    (score !== null && score !== undefined && score >= 60 && score < 80)
  )
    return "medium";
  return "low";
}

function getFitLabel(score: number | null | undefined, fit?: string | null) {
  if (fit) return fit;
  if (score === null || score === undefined) return "Not Scored";
  if (score >= 80) return "High Fit";
  if (score >= 60) return "Medium Fit";
  return "Low Fit";
}

export default function NewLeadPage() {
  const router = useRouter();

  const [website, setWebsite] = useState("");
  const [icp, setIcp] = useState<ICPConfig>({
    industries: ["Technology"],
    companySizes: ["Enterprise"],
    locations: ["USA"],
    businessModels: ["B2B"],
    technologies: ["Microsoft Azure"],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [existingLead, setExistingLead] = useState<Lead | null>(null);
  const [enrichedResult, setEnrichedResult] = useState<Lead | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => (prev + 1) % PROGRESS_STAGES.length);
      }, 4000);
    } else {
      setCurrentStageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const validateUrl = (urlStr: string): boolean => {
    const clean = urlStr.trim();
    if (!clean) {
      setValidationError("Please enter a company website URL.");
      return false;
    }
    if (clean.length < 3) {
      setValidationError("Website URL is too short.");
      return false;
    }
    // Basic domain/URL pattern check
    const pattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!pattern.test(clean)) {
      setValidationError("Please enter a valid website URL (e.g. https://example.com or example.com).");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleWebsiteBlur = async () => {
    const clean = website.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!clean || clean.length < 3) {
      setExistingLead(null);
      return;
    }

    try {
      const res = await fetch(`/api/enrich?checkDomain=${encodeURIComponent(clean)}`, {
        method: "GET",
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.exists && data.lead) {
          setExistingLead(data.lead);
          return;
        }
      }
      setExistingLead(null);
    } catch {
      setExistingLead(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEnrichedResult(null);

    if (!validateUrl(website)) {
      return;
    }

    let cleanWebsite = website.trim();
    if (!cleanWebsite.startsWith("http://") && !cleanWebsite.startsWith("https://")) {
      cleanWebsite = `https://${cleanWebsite}`;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          website: cleanWebsite,
          icp,
        }),
      });

      const rawData = await res.json();

      if (!res.ok || rawData.success === false || rawData.error) {
        throw new Error(
          rawData.error || `Enrichment failed with status code ${res.status}`
        );
      }

      const result = Array.isArray(rawData) ? rawData[0] : rawData;
      setEnrichedResult(result as Lead);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Enrichment submit error:", err);
      setErrorMessage(
        err.message || "Lead enrichment failed. Please verify the URL and network connection."
      );
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWebsite("");
    setEnrichedResult(null);
    setErrorMessage(null);
    setValidationError(null);
    setExistingLead(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8ba298]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#00e599] hover:underline transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0d1511] border border-[#172b20] space-y-1 shadow-xs">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-[#00e599]" />
          Enrich a New Lead
        </h1>
        <p className="text-xs font-medium text-[#8ba298]">
          Enter a target company website URL and configure Ideal Customer Profile (ICP) criteria to extract B2B intelligence signals.
        </p>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="rounded-xl border border-rose-500/30 bg-[#2e0b0e] p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <div className="flex-1 font-semibold">{validationError}</div>
        </div>
      )}

      {/* API Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-[#2e0b0e] p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-200">Lead Enrichment Failed</h4>
            <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading Progress Card */}
      {isLoading && (
        <Card className="border-[#00e599]/30 bg-[#042a1d]/70">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#00e599]" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Extracting Lead Intelligence...</h3>
              <p className="text-xs text-[#00e599] font-semibold">
                {PROGRESS_STAGES[currentStageIndex]}
              </p>
            </div>
            <div className="grid grid-cols-5 gap-1.5 w-full max-w-sm pt-2">
              {PROGRESS_STAGES.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx <= currentStageIndex ? "bg-[#00e599]" : "bg-[#14241c]"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Successful Real Response Summary Card */}
      {enrichedResult && !isLoading && (
        <Card className="border-[#00e599] bg-[#071710] shadow-[0_0_20px_rgba(0,229,153,0.15)] animate-fade-in space-y-5">
          <CardHeader className="pb-3 border-b border-[#172b20]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#00e599]" />
                <span className="text-xs font-bold text-[#00e599] uppercase tracking-wider">
                  Lead Enrichment Complete
                </span>
              </div>
              <span className={`fit-badge ${getFitClass(enrichedResult.score, enrichedResult.fit)}`}>
                {getFitLabel(enrichedResult.score, enrichedResult.fit)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Header company row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d1511] border border-[#14241c]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#00e599]/20 border border-[#00e599]/40 text-[#00e599] flex items-center justify-center font-extrabold text-lg shrink-0">
                  {(enrichedResult.company_name || enrichedResult.domain || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {enrichedResult.company_name || enrichedResult.domain || "Enriched Company"}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#8ba298] font-medium">{enrichedResult.domain}</span>
                    {enrichedResult.website && (
                      <a
                        href={enrichedResult.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#00e599] hover:underline flex items-center gap-1"
                      >
                        Visit Website <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-3 self-start sm:self-center bg-[#070d0a] px-4 py-2 rounded-xl border border-[#172b20]">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#5e756b] uppercase block">ICP Score</span>
                  <span className="text-2xl font-extrabold text-[#00e599]">
                    {enrichedResult.score !== null && enrichedResult.score !== undefined
                      ? enrichedResult.score
                      : "Not Scored"}
                  </span>
                </div>
                {enrichedResult.score !== null && enrichedResult.score !== undefined && (
                  <span className="text-xs text-[#5e756b]">/ 100</span>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#0d1511] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase flex items-center gap-1">
                  <Building2 size={11} /> Industry
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {enrichedResult.industry && enrichedResult.industry.trim()
                    ? enrichedResult.industry
                    : "Not available"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1511] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase flex items-center gap-1">
                  <Users size={11} /> Company Size
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {enrichedResult.company_size && enrichedResult.company_size.trim()
                    ? enrichedResult.company_size
                    : "—"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1511] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase flex items-center gap-1">
                  <Briefcase size={11} /> Business Model
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {enrichedResult.business_model && enrichedResult.business_model.trim()
                    ? enrichedResult.business_model
                    : "—"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1511] border border-[#14241c] space-y-1">
                <span className="text-[10px] font-bold text-[#5e756b] uppercase flex items-center gap-1">
                  <MapPin size={11} /> Location
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {enrichedResult.location && enrichedResult.location.trim()
                    ? enrichedResult.location
                    : "—"}
                </p>
              </div>
            </div>

            {/* Detected Technologies */}
            {enrichedResult.technologies && enrichedResult.technologies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8ba298] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={13} className="text-[#00e599]" />
                  Detected Technologies ({enrichedResult.technologies.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {enrichedResult.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#042a1d] text-[#00e599] border border-[#00e599]/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Signals */}
            {enrichedResult.growth_signals && enrichedResult.growth_signals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8ba298] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-[#f59e0b]" />
                  Growth Signals ({enrichedResult.growth_signals.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {enrichedResult.growth_signals.map((sig, i) => (
                    <div
                      key={i}
                      className="text-xs text-[#c2d1cb] flex items-start gap-2 bg-[#291e05] border border-[#f59e0b]/30 p-2.5 rounded-lg"
                    >
                      <span className="text-[#f59e0b] font-bold shrink-0">▲</span>
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#172b20] flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#8ba298]" />
                Enrich Another Lead
              </Button>
              <Link
                href={`/leads/${encodeURIComponent(enrichedResult.id || enrichedResult.domain || "")}`}
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  View Full Lead Details <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Input Form */}
      {!enrichedResult && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Website URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <Globe className="h-4 w-4 text-[#00e599]" />
                1. Target Company Website
              </CardTitle>
              <CardDescription className="text-[#8ba298]">
                Provide the official URL of the company you want to enrich.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5e756b]" />
                <Input
                  type="text"
                  required
                  placeholder="https://example.com or example.com"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  onBlur={handleWebsiteBlur}
                  disabled={isLoading}
                  className="pl-9 text-xs"
                />
              </div>

              {/* Duplicate Notice */}
              {existingLead && (
                <div className="rounded-xl border border-amber-500/30 bg-[#291e05] p-3.5 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-100">Previously Enriched Lead Found</span>
                      <p className="mt-0.5 text-amber-300/80">
                        {existingLead.company_name || existingLead.domain} was enriched with Score{" "}
                        <strong className="text-amber-400">{existingLead.score ?? "N/A"}/100</strong> ({existingLead.fit || "Enriched"}).
                      </p>
                    </div>
                  </div>
                  <Link href={`/leads/${encodeURIComponent(existingLead.id || existingLead.domain || "")}`}>
                    <Button size="sm" variant="secondary" className="whitespace-nowrap">
                      View Existing Lead <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              <p className="text-xs text-[#5e756b] font-medium">
                Example: https://www.microsoft.com, https://stripe.com
              </p>
            </CardContent>
          </Card>

          {/* Step 2: ICP Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <Sparkles className="h-4 w-4 text-[#00e599]" />
                2. Ideal Customer Profile (ICP) Criteria
              </CardTitle>
              <CardDescription className="text-[#8ba298]">
                Select multiple criteria options to match against the target lead.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <MultiSelect
                label="Target Industries"
                options={ICP_INDUSTRIES}
                selected={icp.industries}
                onChange={(val) => setIcp({ ...icp, industries: val })}
              />

              <MultiSelect
                label="Company Sizes"
                options={ICP_COMPANY_SIZES}
                selected={icp.companySizes}
                onChange={(val) => setIcp({ ...icp, companySizes: val })}
              />

              <MultiSelect
                label="Target Locations"
                options={ICP_LOCATIONS}
                selected={icp.locations}
                onChange={(val) => setIcp({ ...icp, locations: val })}
              />

              <MultiSelect
                label="Business Models"
                options={ICP_BUSINESS_MODELS}
                selected={icp.businessModels}
                onChange={(val) => setIcp({ ...icp, businessModels: val })}
              />

              <MultiSelect
                label="Target Technology Stack"
                options={ICP_TECHNOLOGIES}
                selected={icp.technologies}
                onChange={(val) => setIcp({ ...icp, technologies: val })}
              />
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/">
              <Button variant="ghost" type="button" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !website.trim()}
              className="min-w-[170px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enriching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enrich Lead
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
