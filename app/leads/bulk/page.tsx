"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ICP_INDUSTRIES,
  ICP_TECHNOLOGIES,
} from "@/lib/icp-options";
import { ICPConfig, Lead } from "@/lib/types/lead";
import { MultiSelect } from "@/components/icp/multi-select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFitScore } from "@/lib/utils";
import {
  UploadCloud,
  FileSpreadsheet,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Download,
} from "lucide-react";

interface BatchItem {
  id: string;
  website: string;
  domain: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: Lead | null;
  error?: string | null;
}

export default function BulkEnrichmentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [icp, setIcp] = useState<ICPConfig>({
    industries: ["Technology"],
    companySizes: ["Enterprise"],
    locations: ["USA"],
    businessModels: ["B2B"],
    technologies: ["Microsoft Azure"],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const parseCsvContent = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const items: BatchItem[] = [];

    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      if (idx === 0 && (lower.includes("website") || lower.includes("domain") || lower.includes("company"))) {
        return;
      }

      let rawUrl = line.split(",")[0].replace(/["']/g, "").trim();
      if (!rawUrl) return;

      if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
        rawUrl = `https://${rawUrl}`;
      }

      const domain = rawUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

      items.push({
        id: `batch-${idx}-${Date.now()}`,
        website: rawUrl,
        domain,
        status: "pending",
      });
    });

    setBatchItems(items);
    setCurrentIndex(-1);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sampleCsv = `website,industry\nhttps://www.microsoft.com,Technology\nhttps://stripe.com,FinTech\nhttps://shopify.com,E-commerce`;
    parseCsvContent(sampleCsv);
  };

  const processBatchQueue = async () => {
    if (batchItems.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;

    let startIdx = currentIndex >= 0 && currentIndex < batchItems.length ? currentIndex : 0;

    for (let i = startIdx; i < batchItems.length; i++) {
      if (isPausedRef.current) {
        setIsProcessing(false);
        return;
      }

      setCurrentIndex(i);

      setBatchItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" } : item))
      );

      try {
        const item = batchItems[i];
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: item.website, icp }),
        });

        const rawData = await res.json();

        if (!res.ok || rawData.success === false || rawData.error) {
          throw new Error(rawData.error || `Enrichment failed with status ${res.status}`);
        }

        const leadResult = Array.isArray(rawData) ? rawData[0] : rawData;

        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: "completed", result: leadResult, error: null }
              : it
          )
        );
      } catch (err: any) {
        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: "failed", error: err?.message || "Enrichment request failed" }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentIndex(batchItems.length);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const resetBatch = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentIndex(-1);
    setBatchItems((prev) => prev.map((item) => ({ ...item, status: "pending", result: undefined, error: undefined })));
  };

  const completedCount = batchItems.filter((i) => i.status === "completed").length;
  const failedCount = batchItems.filter((i) => i.status === "failed").length;
  const progressPercentage =
    batchItems.length > 0 ? Math.round(((completedCount + failedCount) / batchItems.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#8ba298]">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[#00e599] hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d1511] border border-[#172b20] space-y-1 shadow-xs">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <UploadCloud className="h-6 w-6 text-[#00e599]" />
          Bulk CSV Lead Enrichment
        </h1>
        <p className="text-xs font-medium text-[#8ba298]">
          Upload a list of target company URLs via CSV to enrich and qualify leads in batch.
        </p>
      </div>

      {/* Upload CSV Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white">
              <FileSpreadsheet className="h-4 w-4 text-[#00e599]" />
              1. Import CSV File
            </span>
            <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs text-[#00e599]">
              <Download className="h-3.5 w-3.5 mr-1" />
              Load Sample CSV
            </Button>
          </CardTitle>
          <CardDescription className="text-[#8ba298]">
            File must contain website URLs or domain names in the first column.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv, text/csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1e362a] bg-[#070d0a] p-8 text-center cursor-pointer hover:border-[#00e599]/50 hover:bg-[#0d1511] transition-all group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#042a1d] border border-[#00e599]/30 text-[#00e599] mb-2 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-white">
              Click to browse or drag and drop your CSV file
            </p>
            <p className="text-[11px] text-[#5e756b] mt-1">
              Supports .csv format with domain header
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ICP Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-white">
            2. Configure ICP Attributes for Batch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiSelect
            label="Target Industries"
            options={ICP_INDUSTRIES}
            selected={icp.industries}
            onChange={(val) => setIcp({ ...icp, industries: val })}
          />

          <MultiSelect
            label="Target Technology Stack"
            options={ICP_TECHNOLOGIES}
            selected={icp.technologies}
            onChange={(val) => setIcp({ ...icp, technologies: val })}
          />
        </CardContent>
      </Card>

      {/* Batch Processing Table */}
      {batchItems.length > 0 && (
        <Card className="border-[#00e599]/30">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white">
                  Batch Queue ({batchItems.length} Domains Loaded)
                </CardTitle>
                <CardDescription className="text-[#8ba298]">
                  {completedCount} completed • {failedCount} failed • {batchItems.length - (completedCount + failedCount)} remaining
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {!isProcessing ? (
                  <Button onClick={processBatchQueue} size="sm">
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    {currentIndex >= 0 ? "Resume Batch" : "Start Batch Queue"}
                  </Button>
                ) : (
                  <Button onClick={togglePause} size="sm" variant="secondary">
                    <Pause className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                    Pause Queue
                  </Button>
                )}

                <Button onClick={resetBatch} size="sm" variant="outline">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#5e756b]" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#14241c] h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#00e599] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-[#14241c]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070d0a] border-b border-[#14241c] text-[#647a70] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">ICP Score</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14241c] bg-[#0d1511]">
                  {batchItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#121c17]">
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.domain}
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 text-[#5e756b] font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                        {item.status === "processing" && (
                          <span className="inline-flex items-center gap-1.5 text-[#00e599] font-bold">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                          </span>
                        )}
                        {item.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 text-[#00e599] font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                          </span>
                        )}
                        {item.status === "failed" && (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                            <XCircle className="h-3.5 w-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {item.result ? (
                          <Badge variant="success">
                            Score {item.result.score ?? "N/A"}/100
                          </Badge>
                        ) : (
                          <span className="text-[#5e756b]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.result ? (
                          <Link href={`/leads/${encodeURIComponent(item.result.id || item.domain)}`}>
                            <Button size="sm" variant="ghost" className="text-[#00e599]">
                              View <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[#5e756b]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
