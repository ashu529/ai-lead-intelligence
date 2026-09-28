import React from "react";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface IcpReasonsProps {
  reasons?: string[] | null;
  matchedCriteria?: string[] | null;
  missingCriteria?: string[] | null;
}

export function IcpReasonsCard({
  reasons,
  matchedCriteria,
  missingCriteria,
}: IcpReasonsProps) {
  const hasReasons = reasons && reasons.length > 0;
  const hasMatched = matchedCriteria && matchedCriteria.length > 0;
  const hasMissing = missingCriteria && missingCriteria.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Why this lead matches */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Why this lead matches
          </h4>
        </div>
        {hasReasons ? (
          <ul className="space-y-2">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific match reasons recorded.</p>
        )}
      </div>

      {/* Matched Criteria */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Matched Criteria
          </h4>
        </div>
        {hasMatched ? (
          <ul className="space-y-2">
            {matchedCriteria.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No matched criteria identified.</p>
        )}
      </div>

      {/* Potential Gaps */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Potential Gaps
          </h4>
        </div>
        {hasMissing ? (
          <ul className="space-y-2">
            {missingCriteria.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No criteria gaps identified.</p>
        )}
      </div>
    </div>
  );
}
