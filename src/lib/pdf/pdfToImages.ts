import type { Canvas } from "@napi-rs/canvas";
import { createRequire } from "node:module";

/**
 * Load the native canvas addon at runtime. The package is externalized in
 * next.config.mjs so its platform-specific native binary is kept intact
 * instead of being bundled into the Next.js server chunk.
 */
const runtimeRequire = createRequire(import.meta.url);

function getCanvasModule(): typeof import("@napi-rs/canvas") {
  return runtimeRequire("@napi-rs/canvas");
}
// The legacy Node.js build avoids pdfjs-dist's browser-only DOM
// dependencies (Worker, DOMMatrix, etc.) that the default entrypoint
// assumes are available.
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface RasterizedPage {
  pageNumber: number;
  bytes: Uint8Array; // JPEG bytes
}

export interface PdfToImagesOptions {
  /** Render scale relative to the PDF's native 72dpi points; 2 ≈ 144dpi, a reasonable screen-quality default. */
  scale?: number;
  jpegQuality?: number; // 0–1
}

/**
 * pdfjs-dist has no built-in Node canvas backend — it expects the browser
 * Canvas API. This factory bridges that gap using @napi-rs/canvas, which
 * ships prebuilt native binaries (no system Cairo/Pango install required),
 * making it realistic for a serverless deploy target like Vercel. This is
 * the one module in Phase 3 that could not be exercised in this sandbox
 * (no network access to install either package) — see the completion
 * report's "known limitations" section before relying on it in
 * production.
 */
class NodeCanvasFactory {
  create(width: number, height: number): { canvas: Canvas; context: ReturnType<Canvas["getContext"]> } {
    const { createCanvas } = getCanvasModule();
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(canvasAndContext: { canvas: Canvas }, width: number, height: number): void {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: { canvas: Canvas | null }): void {
    canvasAndContext.canvas = null;
  }
}

/** Rasterizes every page of a PDF to a JPEG image. */
export async function pdfToImages(bytes: Uint8Array, options: PdfToImagesOptions = {}): Promise<RasterizedPage[]> {
  const scale = options.scale ?? 2;
  const quality = options.jpegQuality ?? 0.85;

  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    // Disables pdfjs' own font/worker machinery that assumes a browser
    // environment; Node needs the standard fonts bundled with pdfjs-dist.
    useSystemFonts: false,
    isEvalSupported: false,
  });

  const doc = await loadingTask.promise;
  const canvasFactory = new NodeCanvasFactory();
  const results: RasterizedPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const { canvas, context } = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));

      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
        // pdfjs-dist's TypeScript types for a custom Node canvas factory
        // are inconsistent across versions; cast through `unknown` here
        // rather than assume a specific exported type name compiles.
      }).promise;

      const jpegBuffer = canvas.toBuffer("image/jpeg", quality);
      results.push({ pageNumber, bytes: new Uint8Array(jpegBuffer) });

      page.cleanup();
    }
  } finally {
    await doc.destroy();
  }

  return results;
}
