import React from "react";
import { Lead } from "@/lib/types/lead";
import { Users, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface StatsCardsProps {
  leads: Lead[];
}

export function StatsCards({ leads }: StatsCardsProps) {
  const totalLeads = leads.length;

  const highFitCount = leads.filter(
    (l) => l.fit === "High Fit" || (l.score !== null && l.score !== undefined && l.score >= 80)
  ).length;

  const mediumFitCount = leads.filter(
    (l) =>
      l.fit === "Medium Fit" ||
      (l.score !== null && l.score !== undefined && l.score >= 60 && l.score < 80)
  ).length;

  const lowFitCount = leads.filter(
    (l) => l.fit === "Low Fit" || (l.score !== null && l.score !== undefined && l.score < 60)
  ).length;

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "High Fit (80-100)",
      value: highFitCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Medium Fit (60-79)",
      value: mediumFitCount,
      icon: AlertCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Low Fit (0-59)",
      value: lowFitCount,
      icon: XCircle,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {stat.title}
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                {stat.value}
              </h3>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${stat.bgColor} ${stat.borderColor}`}
            >
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
