"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { FileDropzone } from "@/components/pdf-tools/FileDropzone";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";
import { trackEvent } from "@/lib/analytics/events";
import { downloadBlob } from "@/lib/downloadBlob";
import { formatBytes } from "@/lib/format";
import {
  BITRATE_OPTIONS,
  MAX_AUDIO_FILES,
  compressAudio,
  isSupportedAudioFile,
} from "@/lib/audio/compress";

interface AudioItem {
  file: File;
  status: "done" | "error";
  blob?: Blob;
  url?: string;
  error?: string;
}

const outName = (file: File) => `${file.name.replace(/\.[^./]+$/, "")}-compressed.mp3`;

export function AudioCompressorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [bitrate, setBitrate] = useState("128");
  const [mono, setMono] = useState(false);
  const [items, setItems] = useState<AudioItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [notice, setNotice] = useState("");
  const generation = useRef(0);

  function revokeUrls(list: AudioItem[]) {
    for (const item of list) if (item.url) URL.revokeObjectURL(item.url);
  }

  function handleFiles(next: File[]) {
    const valid = next.filter(isSupportedAudioFile);
    setNotice(valid.length < next.length ? "Some files were skipped because they aren't audio files." : "");
    setFiles(valid);
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    generation.current += 1;
    const mine = generation.current;
    revokeUrls(items);
    setItems([]);
    setStatus("loading");
    trackEvent({ eventType: "tool_start", toolSlug: "audio-compressor", metadata: { count: files.length } });
    const startedAt = Date.now();

    const results: AudioItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const blob = await compressAudio(file, {
          kbps: Number(bitrate),
          mono,
          onProgress: (f) => {
            if (generation.current === mine) setProgress(`File ${i + 1} of ${files.length} — ${Math.round(f * 100)}%`);
          },
        });
        results.push({ file, status: "done", blob, url: URL.createObjectURL(blob) });
      } catch (err) {
        results.push({ file, status: "error", error: err instanceof Error ? err.message : "Couldn't process this file." });
      }
      if (generation.current !== mine) {
        revokeUrls(results);
        return;
      }
    }

    setItems(results);
    setProgress("");
    const ok = results.filter((r) => r.status === "done").length;
    const durationMs = Date.now() - startedAt;
    if (ok === 0) {
      setStatus("error");
      trackEvent({ eventType: "tool_error", toolSlug: "audio-compressor", metadata: { durationMs, count: files.length } });
    } else {
      setStatus("success");
      trackEvent({
        eventType: "tool_complete",
        toolSlug: "audio-compressor",
        metadata: { durationMs, success: true, count: files.length, failedCount: files.length - ok },
      });
    }
  }

  function handleReset() {
    generation.current += 1;
    revokeUrls(items);
    setFiles([]);
    setItems([]);
    setProgress("");
    setNotice("");
    setStatus("idle");
  }

  function handleDownloadOne(item: AudioItem) {
    if (!item.blob) return;
    downloadBlob(item.blob, outName(item.file));
    trackEvent({ eventType: "download", toolSlug: "audio-compressor", metadata: { filename: outName(item.file) } });
  }

  async function handleDownloadAll() {
    const done = items.filter((i): i is AudioItem & { blob: Blob } => i.status === "done" && !!i.blob);
    if (done.length === 0) return;
    const zip = new JSZip();
    for (const item of done) zip.file(outName(item.file), item.blob);
    downloadBlob(await zip.generateAsync({ type: "blob" }), "compressed-audio.zip");
    trackEvent({ eventType: "download", toolSlug: "audio-compressor", metadata: { filename: "compressed-audio.zip", count: done.length } });
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div>
      <div className="rounded-xs border border-line p-5 shadow-panel sm:p-6">
        <FileDropzone
          label="Audio files to compress"
          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.oga,.flac,.opus,.webm"
          multiple
          maxFiles={MAX_AUDIO_FILES}
          files={files}
          onFilesChange={handleFiles}
          kind="audio"
          hint="MP3, WAV, M4A, OGG or FLAC, up to 100MB each."
        />
        {notice && <p className="mt-2 text-xs text-danger">{notice}</p>}

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="audio-bitrate" label="Quality" value={bitrate} onChange={setBitrate} options={BITRATE_OPTIONS} />
            <label className="flex items-center gap-2 pt-6 text-sm text-ink/80">
              <input type="checkbox" checked={mono} onChange={(e) => setMono(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
              Convert to mono (about half the size)
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSubmit} disabled={files.length === 0 || status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Compressing…
              </>
            ) : (
              "Compress audio"
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
          {progress && <span className="font-mono text-xs text-ink/50" aria-live="polite">{progress}</span>}
        </div>

        {items.length > 0 && (
          <div className="mt-5 border-t border-line pt-5">
            {doneCount > 1 && (
              <div className="mb-3">
                <Button type="button" size="sm" onClick={handleDownloadAll}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download all ({doneCount}) as ZIP
                </Button>
              </div>
            )}
            <ul className="divide-y divide-line rounded-xs border border-line">
              {items.map((item, i) => (
                <li key={`${item.file.name}-${i}`} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
                      {item.status === "done" && item.blob ? (
                        <p className="text-xs text-ink/55">
                          {formatBytes(item.file.size)} → {formatBytes(item.blob.size)}
                          {item.file.size > 0 &&
                            (item.blob.size < item.file.size ? (
                              <> ({Math.round((1 - item.blob.size / item.file.size) * 100)}% smaller)</>
                            ) : (
                              <> (already small — try a lower quality or mono)</>
                            ))}
                        </p>
                      ) : (
                        <p className="text-xs text-danger">{item.error}</p>
                      )}
                    </div>
                    {item.status === "done" && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => handleDownloadOne(item)}>
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        Download
                      </Button>
                    )}
                  </div>
                  {item.url && <audio src={item.url} controls className="mt-3 w-full" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <HowToUse
        steps={[
          "Add one or more audio files.",
          "Pick a quality — 128 kbps for music, 64 kbps mono for voice — and compress.",
          "Preview the result, then download each file or all of them as a ZIP.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "A 40 MB WAV recording at 128 kbps", output: "Roughly 1 MB per minute of audio" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — your audio is never uploaded anywhere.</p>
    </div>
  );
}

export default AudioCompressorTool;
