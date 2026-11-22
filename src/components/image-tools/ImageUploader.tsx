"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

export interface ImageUploaderProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  hint?: string;
}

interface Thumbnail {
  file: File;
  url: string;
}

/**
 * Shared upload surface for every image tool: drag-and-drop, click/tap to
 * browse, per-file thumbnail preview, remove-one, and clear-all. Built
 * once here rather than duplicated per tool, per the brief's explicit
 * requirement. Accepts JPG/PNG/WebP — real validation happens in
 * src/lib/image/validation.ts once a file is added, not here (this
 * component only gates the file picker's `accept` attribute, which is a
 * UX hint, not a security control).
 */
export function ImageUploader({ label, multiple = false, maxFiles, files, onFilesChange, hint }: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  // Rebuild thumbnail object URLs whenever the file list changes, and
  // revoke the previous ones so we don't leak memory across selections.
  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setThumbnails(next);
    return () => {
      for (const thumb of next) URL.revokeObjectURL(thumb.url);
    };
  }, [files]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const incomingArray = Array.from(incoming);
      const combined = multiple ? [...files, ...incomingArray] : incomingArray.slice(0, 1);
      const limited = maxFiles ? combined.slice(0, maxFiles) : combined;
      onFilesChange(limited);
    },
    [files, multiple, maxFiles, onFilesChange]
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = "";
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function clearAll() {
    onFilesChange([]);
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-ink/80">
        {label}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xs border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragActive ? "border-indigo-400 bg-indigo-50/60" : "border-line hover:border-indigo-300"
        )}
      >
        <Upload className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        <p className="text-sm text-ink/70">
          <span className="font-medium text-indigo-600">Choose {multiple ? "images" : "an image"}</span> or drag and drop
        </p>
        {hint && <p className="text-xs text-ink/45">{hint}</p>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {thumbnails.length > 0 && (
        <div className="mt-3 space-y-2">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {thumbnails.map((thumb, i) => (
              <li key={`${thumb.file.name}-${thumb.file.size}-${i}`} className="relative overflow-hidden rounded-xs border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb.url} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${thumb.file.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-xs bg-ink/60 text-paper transition-colors hover:bg-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <p className="truncate bg-paper/95 px-1.5 py-1 text-[11px] text-ink/60">
                  {thumb.file.name} · {formatBytes(thumb.file.size)}
                </p>
              </li>
            ))}
          </ul>
          {files.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-ink/50 underline-offset-2 hover:text-danger hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
