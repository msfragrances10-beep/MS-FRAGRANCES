import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80",
    secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
    destructive: "border-transparent bg-red-500 text-neutral-50 hover:bg-red-500/80",
    outline: "text-neutral-950 border border-neutral-200",
    success: "border-transparent bg-emerald-500 text-neutral-50 hover:bg-emerald-500/80",
    warning: "border-transparent bg-amber-500 text-neutral-50 hover:bg-amber-500/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
