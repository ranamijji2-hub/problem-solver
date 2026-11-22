let webpSupportCache: boolean | null = null;

/**
 * Checks whether the current browser can *encode* WebP (decoding support
 * is nearly universal; encoding via canvas is not guaranteed on older
 * WebKit). Cached after the first check since the answer can't change
 * during a session. Used to decide whether the Optimizer can offer WebP,
 * and to show a clear message on the WebP Converter tool if the browser
 * can't produce the format the user asked for — matching the
 * "unsupported format" case in the brief's error-handling requirements.
 */
export async function isWebpEncodingSupported(): Promise<boolean> {
  if (webpSupportCache !== null) return webpSupportCache;
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL("image/webp");
    webpSupportCache = dataUrl.startsWith("data:image/webp");
    return webpSupportCache;
  } catch {
    webpSupportCache = false;
    return false;
  }
}
