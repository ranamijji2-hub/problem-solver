"use client";

import { useEffect, useState } from "react";
import type { ImageMeta } from "@/components/image-tools/ImagePreview";

/** Loads a File into an ImagePreview-ready ImageMeta (dimensions + object URL), and cleans up the URL on change/unmount. */
export function useImageMeta(file: File | null, format?: string): ImageMeta | null {
  const [meta, setMeta] = useState<ImageMeta | null>(null);

  useEffect(() => {
    if (!file) {
      setMeta(null);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    let cancelled = false;

    img.onload = () => {
      if (cancelled) return;
      setMeta({
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: format ?? (file.type.replace("image/", "") || "unknown"),
        filename: file.name,
      });
    };
    img.onerror = () => {
      if (!cancelled) setMeta(null);
    };
    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file, format]);

  return meta;
}
