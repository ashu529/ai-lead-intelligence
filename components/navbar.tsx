"use client";

import React from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full h-[54px] bg-[#070d0a]/90 backdrop-blur-md border-b border-[#13221b] px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Mobile / Toggle Menu Button */}
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-[#0a231b] border border-[#00e599]/40 flex items-center justify-center text-[#00e599] hover:bg-[#0f3025] transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu size={16} />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5e756b]" />
          <input
            type="text"
            placeholder="Search companies, domains, or industries..."
            className="search-input-header pl-9 pr-12 w-full"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#13221b] border border-[#1d352a] text-[10px] font-semibold text-[#8ba298]">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-[#0b1410] border border-[#14241c] hover:border-[#1e382c] flex items-center justify-center text-[#94a3b8] hover:text-white transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00e599]" />
        </button>

        {/* User Badge Pill */}
        <div className="flex items-center gap-2 pl-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#00e599] text-[#03140e] flex items-center justify-center text-xs font-extrabold shadow-[0_0_8px_rgba(0,229,153,0.3)]">
            AS
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-[#00e599] transition-colors hidden sm:inline-block">
            Ashutosh Singh
          </span>
          <ChevronDown size={14} className="text-[#647a70] group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}
