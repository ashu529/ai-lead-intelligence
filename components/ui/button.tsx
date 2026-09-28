import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", children, disabled, ...props },
    ref
  ) => {
    const variantStyles = {
      default:
        "bg-[#00e599] hover:bg-[#00cc88] text-[#03140e] font-bold shadow-[0_0_14px_rgba(0,229,153,0.25)] border border-[#00e599]",
      secondary:
        "bg-[#0f1c16] hover:bg-[#15271f] text-white border border-[#1e362a] font-semibold",
      outline:
        "bg-transparent hover:bg-[#14241c] text-[#c2d1cb] border border-[#1e362a] hover:text-white font-medium",
      ghost: "bg-transparent hover:bg-[#14241c] text-[#8ba298] hover:text-white font-medium",
      danger:
        "bg-[#2e0b0e] hover:bg-[#3d0f13] text-[#f87171] border border-[#ef4444]/40 font-semibold",
    };

    const sizeStyles = {
      sm: "px-2.5 py-1 text-xs rounded-md gap-1.5 h-7",
      md: "px-3.5 py-1.5 text-xs rounded-lg gap-2 h-8 font-medium",
      lg: "px-4 py-2 text-sm rounded-lg gap-2 h-9 font-medium",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
