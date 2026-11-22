"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "value"> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  suffix?: string;
  hint?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  suffix,
  hint,
  className,
  ...rest
}: NumberFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink/80">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            "w-full rounded-xs border bg-paper px-3 py-2.5 font-mono text-sm text-ink transition-colors focus:outline-none",
            error ? "border-danger" : "border-line focus:border-indigo-400",
            suffix && "pr-12"
          )}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink/40">
            {suffix}
          </span>
        )}
      </div>
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
