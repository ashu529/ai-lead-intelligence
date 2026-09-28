import React from "react";
import { ScoreBreakdown } from "@/lib/types/lead";
import { Building2, Users, MapPin, DollarSign, Cpu, TrendingUp, Briefcase } from "lucide-react";

interface ScoreBreakdownProps {
  breakdown?: ScoreBreakdown | null;
}

export function ScoreBreakdownCards({ breakdown }: ScoreBreakdownProps) {
  const categories = [
    {
      key: "industry",
      label: "Industry Alignment",
      max: 25,
      val: breakdown?.industry ?? 0,
      icon: Building2,
    },
    {
      key: "company_size",
      label: "Company Size Match",
      max: 20,
      val: breakdown?.company_size ?? 0,
      icon: Users,
    },
    {
      key: "geography",
      label: "Geography & Location",
      max: 15,
      val: breakdown?.geography ?? 0,
      icon: MapPin,
    },
    {
      key: "revenue",
      label: "Revenue Data",
      max: 15,
      val: 0,
      isUnavailable: true,
      icon: DollarSign,
    },
    {
      key: "technology",
      label: "Technology Stack Match",
      max: 10,
      val: breakdown?.technology ?? 0,
      icon: Cpu,
    },
    {
      key: "growth",
      label: "Growth Signals",
      max: 10,
      val: breakdown?.growth ?? 0,
      icon: TrendingUp,
    },
    {
      key: "business_model",
      label: "Business Model Match",
      max: 5,
      val: breakdown?.business_model ?? 0,
      icon: Briefcase,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/90 shadow-sm">
      <table className="w-full text-left text-xs font-sans">
        <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-5 py-3">Criteria Breakdown</th>
            <th className="px-5 py-3 text-center">Score Weight</th>
            <th className="px-5 py-3 text-right">Status & Evaluation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const percentage = Math.min(100, Math.round((cat.val / cat.max) * 100));

            return (
              <tr key={cat.key} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-200">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{cat.label}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center text-white font-bold">
                  {cat.val} <span className="text-slate-500 font-normal">/ {cat.max}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  {cat.isUnavailable ? (
                    <span className="inline-flex items-center text-amber-400 text-xs font-medium">
                      Revenue 0 / 15 — Not available
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">
                      {percentage}% matched
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
