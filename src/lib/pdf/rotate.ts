import { PDFDocument, degrees } from "pdf-lib";

export type RotationDegrees = 90 | 180 | 270;

/**
 * Rotates every page of a PDF by a fixed multiple of 90°, relative to its
 * current rotation (so rotating an already-rotated page twice compounds
 * correctly rather than resetting it).
 */
export async function rotatePdf(bytes: Uint8Array, rotation: RotationDegrees): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }
  return doc.save();
}
