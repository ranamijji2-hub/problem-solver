import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";
import { getToolPath } from "@/lib/tools/registry";
import { Badge } from "@/components/ui/Badge";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const isLive = tool.status === "live";

  return (
    <Link
      href={getToolPath(tool)}
      className="group flex flex-col justify-between rounded-xs border border-line bg-paper/70 p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lift"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-base font-semibold text-ink">{tool.name}</p>
          {!isLive && (
            <Badge tone="amber" className="shrink-0">
              Coming soon
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-snug text-ink/55">{tool.shortDescription}</p>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
        {isLive ? "Open tool" : "See details"}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
