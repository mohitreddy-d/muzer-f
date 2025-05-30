import { cn } from "@/lib/utils";
import React from "react";

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function InteractiveButton({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: InteractiveButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
      "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
      "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white": variant === "outline",
      "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white": variant === "ghost",

      "h-9 px-3 text-sm": size === "sm",
      "h-10 px-4 text-base": size === "md",
      "h-12 px-6 text-lg": size === "lg",
    },
    className
  );

  return (
    <button
      className={baseClasses}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
      </span>
    </button>
  );
} 