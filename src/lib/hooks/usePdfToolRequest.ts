"use client";

import { useCallback, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics/events";
import { downloadBlob } from "@/lib/downloadBlob";

export type PdfToolStatus = "idle" | "loading" | "success" | "error";

export interface UsePdfToolRequestResult {
  status: PdfToolStatus;
  errorMessage: string | null;
  resultFilename: string | null;
  resultSize: number | null;
  responseHeaders: Headers | null;
  submit: (formData: FormData) => Promise<void>;
  reset: () => void;
  download: () => void;
}

// Comfortably exceeds every PDF route's own `maxDuration` (30s, or 60s for
// pdf-to-images) so a normal-but-slow request always gets a real server
// response first. This is a safety net for the case a server response
// never arrives at all (e.g. an infra-level hang) — without it, the UI
// could show "Processing…" forever with no way to recover except a full
// page reload.
const REQUEST_TIMEOUT_MS = 75_000;

/**
 * Drives the request lifecycle every PDF tool shares: submit a FormData
 * payload to its API route, track start/complete/error analytics events
 * (including processing duration) through the existing analytics
 * pipeline, and expose a one-call `download()` for the result — so each
 * tool component only has to build the FormData and render the states.
 */
export function usePdfToolRequest(toolSlug: string, endpoint: string): UsePdfToolRequestResult {
  const [status, setStatus] = useState<PdfToolStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState<string | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Headers | null>(null);

  // Tracks the in-flight request's controller so `reset()` (see below) can
  // actually cancel it — not just clear the state around it. Without this,
  // clicking Reset while a request is still processing doesn't stop that
  // request; when it eventually resolves, its success/error would silently
  // overwrite the freshly-reset "idle" state with a stale result the user
  // never asked to see anymore.
  const activeController = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (formData: FormData) => {
      // A new submit always supersedes whatever request came before it —
      // same reasoning as reset, just triggered by starting over instead
      // of explicitly cancelling.
      activeController.current?.abort();

      setStatus("loading");
      setErrorMessage(null);
      trackEvent({ eventType: "tool_start", toolSlug });
      const startedAt = Date.now();

      const controller = new AbortController();
      activeController.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const res = await fetch(endpoint, { method: "POST", body: formData, signal: controller.signal });
        const durationMs = Date.now() - startedAt;

        // The request that started this call may have been superseded by
        // a reset or a newer submit while it was in flight. Applying its
        // result now would resurrect state the user has already moved on
        // from, so silently drop it — the newer request (if any) owns the
        // UI, and if it was a plain reset, nothing should reappear at all.
        if (activeController.current !== controller) return;

        if (!res.ok) {
          let message = "Something went wrong. Please try again.";
          try {
            const data: unknown = await res.json();
            if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
              message = data.error;
            }
          } catch {
            // Response wasn't JSON — keep the generic message.
          }
          setStatus("error");
          setErrorMessage(message);
          trackEvent({
            eventType: "tool_error",
            toolSlug,
            metadata: { durationMs, httpStatus: res.status },
          });
          return;
        }

        const blob = await res.blob();
        if (activeController.current !== controller) return; // superseded during the blob read itself

        const disposition = res.headers.get("Content-Disposition") ?? "";
        const match = /filename="([^"]+)"/.exec(disposition);
        const filename = match?.[1] ?? "download";

        setResultBlob(blob);
        setResultFilename(filename);
        setResponseHeaders(res.headers);
        setStatus("success");
        trackEvent({
          eventType: "tool_complete",
          toolSlug,
          metadata: { durationMs, success: true },
        });
      } catch (err) {
        if (activeController.current !== controller) return; // aborted by reset/resubmit, not a real failure to report

        const durationMs = Date.now() - startedAt;
        const timedOut = err instanceof DOMException && err.name === "AbortError";
        setStatus("error");
        setErrorMessage(
          timedOut
            ? "This is taking longer than expected. Please try again, or try a smaller file."
            : "Network error — check your connection and try again."
        );
        trackEvent({
          eventType: "tool_error",
          toolSlug,
          metadata: { durationMs, network: !timedOut, timedOut },
        });
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [endpoint, toolSlug]
  );

  const reset = useCallback(() => {
    activeController.current?.abort();
    activeController.current = null;
    setStatus("idle");
    setErrorMessage(null);
    setResultBlob(null);
    setResultFilename(null);
    setResponseHeaders(null);
  }, []);

  const download = useCallback(() => {
    if (!resultBlob || !resultFilename) return;
    downloadBlob(resultBlob, resultFilename);
    trackEvent({ eventType: "download", toolSlug, metadata: { filename: resultFilename } });
  }, [resultBlob, resultFilename, toolSlug]);

  return {
    status,
    errorMessage,
    resultFilename,
    resultSize: resultBlob?.size ?? null,
    responseHeaders,
    submit,
    reset,
    download,
  };
}
