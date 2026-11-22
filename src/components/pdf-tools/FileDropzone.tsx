"use client";

import { useCallback, useId, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Image as ImageIcon, Music, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/pdf/constraints";

export interface FileDropzoneProps {
  label: string;
  accept: string; // e.g. "application/pdf,.pdf"
  multiple?: boolean;
  maxFiles?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  hint?: string;
  kind?: "pdf" | "image" | "audio";
}

export function FileDropzone({
  label,
  accept,
  multiple = false,
  maxFiles,
  files,
  onFilesChange,
  hint,
  kind = "pdf",
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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
    // Reset so selecting the same file again still fires a change event.
    e.target.value = "";
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function clearAll() {
    onFilesChange([]);
  }

  const Icon = kind === "image" ? ImageIcon : kind === "audio" ? Music : FileText;

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
          <span className="font-medium text-indigo-600">Choose {multiple ? "files" : "a file"}</span> or drag and drop
        </p>
        {hint && <p className="text-xs text-ink/45">{hint}</p>}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <ul className="divide-y divide-line rounded-xs border border-line">
            {files.map((file, i) => (
              <li key={`${file.name}-${file.size}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                  <span className="truncate text-sm text-ink/80">{file.name}</span>
                  <span className="shrink-0 text-xs text-ink/40">{formatBytes(file.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 rounded-xs p-1 text-ink/40 transition-colors hover:text-danger"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
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
