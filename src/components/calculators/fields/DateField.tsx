"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value"> {
  id: string;
  label: string;
  value: string; // yyyy-mm-dd, matches native <input type="date">
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}

export function DateField({ id, label, value, onChange, error, hint, className, ...rest }: DateFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(
          "w-full rounded-xs border bg-paper px-3 py-2.5 font-mono text-sm text-ink transition-colors focus:outline-none",
          error ? "border-danger" : "border-line focus:border-indigo-400"
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink/45">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
