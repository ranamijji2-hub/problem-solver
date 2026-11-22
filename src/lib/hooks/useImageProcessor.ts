"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics/events";
import { downloadBlob } from "@/lib/downloadBlob";

export type ImageToolStatus = "idle" | "loading" | "success" | "error";

export interface ImageProcessResult {
  blob: Blob;
  width: number;
  height: number;
  filename: string;
}

interface RunOutput {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Drives the same idle → loading → success/error lifecycle as Phase 3's
 * usePdfToolRequest, but runs a local async function (a Canvas operation)
 * instead of a fetch — since every image tool processes entirely in the
 * browser. Fires the same tool_start/tool_complete/tool_error/download
 * analytics events through the existing pipeline, with processing
 * duration, so image and PDF tools are equally visible in analytics.
 */
export function useImageProcessor(toolSlug: string) {
  const [status, setStatus] = useState<ImageToolStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ImageProcessResult | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Revokes the previous object URL whenever it changes or the component unmounts, so a session with many "process again" runs doesn't leak memory.
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  // Canvas operations aren't cancellable the way a fetch is (no
  // AbortController equivalent), so staleness is tracked with a simple
  // generation counter instead: each run() bumps it and captures its own
  // value; reset() also bumps it. If the counter has moved on by the time
  // an async run() finishes, its result is stale (superseded by a reset or
  // a newer run) and is silently discarded instead of resurrecting state
  // the user already moved past — same bug class, same fix as
  // usePdfToolRequest's AbortController-based version.
  const generation = useRef(0);

  const run = useCallback(
    async <T extends RunOutput>(fn: () => Promise<T>, filename: string | ((output: T) => string)) => {
      generation.current += 1;
      const myGeneration = generation.current;

      setStatus("loading");
      setErrorMessage(null);
      trackEvent({ eventType: "tool_start", toolSlug });
      const startedAt = Date.now();

      try {
        const output = await fn();
        if (generation.current !== myGeneration) return; // superseded by reset/resubmit while processing

        const durationMs = Date.now() - startedAt;
        const resolvedFilename = typeof filename === "function" ? filename(output) : filename;
        const url = URL.createObjectURL(output.blob);
        setResult({ blob: output.blob, width: output.width, height: output.height, filename: resolvedFilename });
        setResultUrl(url);
        setStatus("success");
        trackEvent({ eventType: "tool_complete", toolSlug, metadata: { durationMs, success: true } });
      } catch (err) {
        if (generation.current !== myGeneration) return; // superseded — don't report a stale failure either

        const durationMs = Date.now() - startedAt;
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setStatus("error");
        setErrorMessage(message);
        trackEvent({ eventType: "tool_error", toolSlug, metadata: { durationMs } });
      }
    },
    [toolSlug]
  );

  const reset = useCallback(() => {
    generation.current += 1;
    setStatus("idle");
    setErrorMessage(null);
    setResult(null);
    setResultUrl(null);
  }, []);

  const download = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.filename);
    trackEvent({ eventType: "download", toolSlug, metadata: { filename: result.filename } });
  }, [result, toolSlug]);

  return { status, errorMessage, result, resultUrl, run, reset, download };
}
