import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#1a2f26] bg-[#070d0a] px-3.5 py-1.5 text-xs font-medium text-white placeholder:text-[#5e756b] focus:border-[#00e599] focus:outline-none focus:ring-2 focus:ring-[#00e599]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 shadow-xs",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
