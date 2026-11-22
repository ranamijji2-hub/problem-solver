"use client";

import { useCallback, useState } from "react";

/**
 * Copies text to the clipboard and exposes a transient `copied` flag for
 * UI feedback (e.g. swapping a button's label to "Copied!" for two
 * seconds). Falls back to a hidden-textarea + execCommand approach for
 * browsers/contexts where navigator.clipboard is unavailable (e.g. non-
 * HTTPS local network testing).
 */
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently no-op — a failed copy shouldn't surface as an app error.
    }
  }, []);

  return [copied, copy];
}
