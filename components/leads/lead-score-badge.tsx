import React from "react";
import { formatFitScore } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LeadScoreBadgeProps {
  score: number | null;
  fit?: string | null;
}

export function LeadScoreBadge({ score, fit }: LeadScoreBadgeProps) {
  const fitInfo = formatFitScore(score);
  const displayFit = fit || fitInfo.label;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 px-5 py-3 shadow-sm">
      <div className="flex flex-col items-center border-r border-slate-800 pr-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          ICP Score
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className={`text-3xl font-extrabold tracking-tight ${fitInfo.colorClass}`}>
            {score !== null && score !== undefined ? score : "N/A"}
          </span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Qualification
        </span>
        <Badge className={`${fitInfo.bgClass} ${fitInfo.colorClass} ${fitInfo.borderClass} uppercase font-bold text-xs px-3 py-1`}>
          {displayFit}
        </Badge>
      </div>
    </div>
  );
}
