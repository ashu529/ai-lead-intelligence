"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8ba298]">
          {label}
        </label>
        <span className="text-xs font-semibold text-[#00e599] bg-[#042a1d] border border-[#00e599]/30 px-2 py-0.5 rounded-full">
          {selected.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-[#14241c] bg-[#070d0a] p-3.5 min-h-[48px]">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              type="button"
              key={option}
              onClick={() => toggleOption(option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-150 border cursor-pointer select-none shadow-2xs",
                isSelected
                  ? "bg-[#00e599] text-[#03140e] border-[#00e599] font-bold shadow-[0_0_10px_rgba(0,229,153,0.3)]"
                  : "bg-[#0d1511] text-[#c2d1cb] border-[#182a20] hover:border-[#00e599]/40 hover:bg-[#121c17] font-medium"
              )}
            >
              {isSelected ? (
                <Check className="h-3.5 w-3.5 text-[#03140e] stroke-[3]" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-[#5e756b]" />
              )}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
