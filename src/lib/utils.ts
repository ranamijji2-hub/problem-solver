import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists safely (later classes win on conflicts). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  // Vercel exposes the production project URL and deployment URL
  // automatically. This prevents production metadata from accidentally
  // falling back to localhost when the public site URL wasn't configured.
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;

  const vercelDeployment = process.env.VERCEL_URL?.trim();
  if (vercelDeployment) return `https://${vercelDeployment}`;

  return "http://localhost:3000";
}
