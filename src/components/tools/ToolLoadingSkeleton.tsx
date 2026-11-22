/**
 * Shown by next/dynamic while a tool's component chunk is downloading
 * (see src/app/[category]/[tool]/page.tsx). Without this, dynamic() shows
 * nothing at all during the load, which reads as a broken/blank page on a
 * slow connection — this keeps the layout stable and gives clear loading
 * feedback instead.
 */
export function ToolLoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading tool" className="animate-pulse rounded-xs border border-line p-5 sm:p-6">
      <div className="h-10 rounded-xs bg-line/40" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-16 rounded-xs bg-line/30" />
        <div className="h-16 rounded-xs bg-line/30" />
      </div>
      <div className="mt-4 h-9 w-32 rounded-xs bg-line/40" />
    </div>
  );
}
