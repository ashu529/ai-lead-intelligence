import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#0b1410] text-white border-[#14241c]",
    secondary: "bg-[#10202d] text-[#60a5fa] border-[#1d3b5a]",
    outline: "bg-transparent text-[#8ba298] border-[#1e362a]",
    success: "bg-[#042a1d] text-[#00e599] border-[#00e599]/40 font-bold",
    warning: "bg-[#291e05] text-[#f59e0b] border-[#f59e0b]/40 font-bold",
    danger: "bg-[#2e0b0e] text-[#f87171] border-[#ef4444]/40 font-bold",
    info: "bg-[#0c242b] text-[#38bdf8] border-[#38bdf8]/40 font-bold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
