import { describe, expect, it } from "vitest";
import { detectImageFormat, validateImageFileSync, MAX_IMAGE_FILE_SIZE_BYTES } from "./validation";

function bytesFrom(arr: number[]): Uint8Array {
  return new Uint8Array(arr);
}

describe("detectImageFormat", () => {
  it("detects a JPEG signature", () => {
    expect(detectImageFormat(bytesFrom([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe("jpeg");
  });

  it("detects a PNG signature", () => {
    expect(detectImageFormat(bytesFrom([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]))).toBe("png");
  });

  it("detects a WebP signature", () => {
    // "RIFF"    size(4 bytes, any)   "WEBP"
    const bytes = bytesFrom([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    expect(detectImageFormat(bytes)).toBe("webp");
  });

  it("returns null for an unrecognized signature", () => {
    expect(detectImageFormat(bytesFrom([0x00, 0x01, 0x02, 0x03]))).toBeNull();
  });

  it("returns null for a truncated/too-short buffer", () => {
    expect(detectImageFormat(bytesFrom([0xff, 0xd8]))).toBeNull();
  });

  it("does not misidentify a RIFF file that isn't WebP (e.g. a WAV file)", () => {
    const bytes = bytesFrom([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]); // "WAVE" not "WEBP"
    expect(detectImageFormat(bytes)).toBeNull();
  });
});

describe("validateImageFileSync", () => {
  function makeFile(name: string, size: number, type: string): File {
    return new File([new Uint8Array(size)], name, { type });
  }

  it("accepts a valid JPEG", () => {
    const file = makeFile("photo.jpg", 1000, "image/jpeg");
    const result = validateImageFileSync(file, bytesFrom([0xff, 0xd8, 0xff, 0, 0]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.format).toBe("jpeg");
  });

  it("rejects an empty file", () => {
    const file = makeFile("empty.jpg", 0, "image/jpeg");
    const result = validateImageFileSync(file, bytesFrom([]));
    expect(result.ok).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const file = makeFile("huge.jpg", MAX_IMAGE_FILE_SIZE_BYTES + 1, "image/jpeg");
    const result = validateImageFileSync(file, bytesFrom([0xff, 0xd8, 0xff]));
    expect(result.ok).toBe(false);
  });

  it("rejects a disallowed extension even with a valid-looking size", () => {
    const file = makeFile("document.pdf", 1000, "application/pdf");
    const result = validateImageFileSync(file, bytesFrom([0x25, 0x50, 0x44, 0x46]));
    expect(result.ok).toBe(false);
  });

  it("rejects a file whose extension claims an image but whose bytes are not a real image (spoofed file)", () => {
    // Named like a PNG, declares image/png, but the actual bytes are not a PNG signature.
    const file = makeFile("fake.png", 1000, "image/png");
    const result = validateImageFileSync(file, bytesFrom([0x00, 0x11, 0x22, 0x33, 0x44]));
    expect(result.ok).toBe(false);
  });

  it("rejects a mismatched declared MIME type", () => {
    const file = makeFile("photo.jpg", 1000, "application/octet-stream");
    const result = validateImageFileSync(file, bytesFrom([0xff, 0xd8, 0xff]));
    expect(result.ok).toBe(false);
  });
});
