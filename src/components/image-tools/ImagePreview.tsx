import { formatBytes } from "@/lib/format";

export interface ImageMeta {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  filename: string;
}

function Panel({ label, meta }: { label: string; meta: ImageMeta }) {
  return (
    <div className="flex-1 rounded-xs border border-line p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{label}</p>
      <div className="mt-2 overflow-hidden rounded-xs border border-line bg-line/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.url} alt="" className="max-h-64 w-full object-contain" />
      </div>
      <dl className="mt-2 space-y-0.5 text-xs text-ink/60">
        <div className="flex justify-between">
          <dt>Dimensions</dt>
          <dd className="font-mono">
            {meta.width} × {meta.height}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Size</dt>
          <dd className="font-mono">{formatBytes(meta.size)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Format</dt>
          <dd className="font-mono uppercase">{meta.format}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Shows one image's details, or a before/after pair when `after` is provided. */
export function ImagePreview({ before, after }: { before: ImageMeta; after?: ImageMeta }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Panel label={after ? "Original" : "Preview"} meta={before} />
      {after && <Panel label="Result" meta={after} />}
    </div>
  );
}
