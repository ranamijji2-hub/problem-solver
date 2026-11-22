export type ImageFormat = "jpeg" | "png" | "webp";

export interface Dimensions {
  width: number;
  height: number;
}

export const FORMAT_MIME: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const FORMAT_EXTENSION: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

/** Whether a format's encoder honors a quality parameter (PNG is always lossless — canvas ignores quality for it). */
export function isLossyFormat(format: ImageFormat): boolean {
  return format === "jpeg" || format === "webp";
}
