import JSZip from "jszip";

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/** Builds a ZIP archive in memory from a list of named byte buffers. Used wherever a tool produces more than one output file. */
export async function buildZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.name, entry.bytes);
  }
  const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return buffer;
}
