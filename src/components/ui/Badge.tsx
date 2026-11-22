import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "amber" | "teal";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-line/60 text-ink/70",
  amber: "bg-amber-100 text-amber-700",
  teal: "bg-teal-50 text-teal-700",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-medium tracking-wide",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
