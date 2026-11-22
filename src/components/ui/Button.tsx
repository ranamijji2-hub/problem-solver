import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-sm hover:shadow-lift hover:brightness-110 active:brightness-95",
  secondary:
    "bg-paper/60 text-ink border border-line shadow-sm hover:border-indigo-400 hover:text-indigo-600",
  ghost: "bg-transparent text-ink hover:bg-line/40",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2.5",
};

const base =
  "inline-flex items-center justify-center font-medium rounded-xs transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variantStyles[variant], sizeStyles[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </Link>
  );
}
