"use client";

import { cn } from "@/lib/utils";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5 rounded-xs border border-line bg-line/20 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xs px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              active ? "bg-paper text-indigo-600 shadow-panel" : "text-ink/55 hover:text-ink/80"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
