"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  Layers,
  Zap,
  Settings,
  ChevronDown,
  Plus,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Directory", href: "/directory", icon: Users },
  { label: "Enrich Lead", href: "/leads/new", icon: Search },
  { label: "Batch Enrich", href: "/leads/bulk", icon: Layers },
  { label: "Automations", href: "#automations", icon: Zap },
  { label: "Settings", href: "/login", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#122119]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-lg bg-[#00e599] flex items-center justify-center text-[#041911] shadow-[0_0_12px_rgba(0,229,153,0.3)] shrink-0 font-extrabold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight tracking-tight">
              Lead Intelligence
            </div>
            <div className="text-[10px] text-[#647a70] font-medium mt-0.5">
              Find. Enrich. Qualify.
            </div>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-3 px-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/" && item.label === "Dashboard"
              : item.href !== "#" && !item.href.startsWith("#") && pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
            >
              <Icon
                size={16}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-[#00e599]" : "text-[#5e756b]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Promo Box */}
      <div className="p-3 border-t border-[#122119]">
        <div className="rounded-xl bg-[#0d1712] border border-[#172b20] p-3.5 mb-3 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-[#07291d] border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-snug">
              Turn company data into opportunities
            </div>
            <div className="text-[11px] text-[#647a70] mt-1 leading-relaxed">
              Enrich leads, validate fit, and focus on what matters.
            </div>
          </div>
          <Link
            href="/leads/new"
            className="flex items-center justify-center gap-1.5 w-full bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] rounded-lg py-2 text-xs font-bold transition-all shadow-[0_0_14px_rgba(0,229,153,0.2)]"
          >
            <Plus size={14} strokeWidth={3} />
            Enrich Account
          </Link>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b1410] border border-[#14241c] hover:border-[#1e382c] cursor-pointer transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#00e599] text-[#03140e] flex items-center justify-center text-xs font-extrabold shrink-0 shadow-[0_0_8px_rgba(0,229,153,0.3)]">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                Ashutosh Singh
              </div>
              <div className="text-[10px] text-[#647a70] truncate">
                Free Plan
              </div>
            </div>
          </div>
          <ChevronDown size={14} className="text-[#647a70] shrink-0" />
        </div>
      </div>
    </aside>
  );
}
