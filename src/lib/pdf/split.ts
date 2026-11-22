import { PDFDocument } from "pdf-lib";

export interface SplitOutput {
  name: string;
  bytes: Uint8Array;
}

async function extractGroup(source: PDFDocument, pageIndices: number[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(source, pageIndices);
  for (const page of copied) out.addPage(page);
  return out.save();
}

/** Splits every page of a PDF into its own single-page PDF file. */
export async function splitEveryPage(bytes: Uint8Array, baseName: string): Promise<SplitOutput[]> {
  const source = await PDFDocument.load(bytes);
  const pageCount = source.getPageCount();
  const outputs: SplitOutput[] = [];

  for (let i = 0; i < pageCount; i++) {
    const pageBytes = await extractGroup(source, [i]);
    outputs.push({ name: `${baseName}-page-${i + 1}.pdf`, bytes: pageBytes });
  }

  return outputs;
}

/** Splits a PDF into one output file per page-index group (see parseSplitGroups). */
export async function splitByGroups(bytes: Uint8Array, groups: number[][], baseName: string): Promise<SplitOutput[]> {
  const source = await PDFDocument.load(bytes);
  const outputs: SplitOutput[] = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!group || group.length === 0) continue;
    const first = group[0];
    const last = group[group.length - 1];
    if (first === undefined || last === undefined) continue;
    const groupBytes = await extractGroup(source, group);
    const label = group.length === 1 ? `page-${first + 1}` : `pages-${first + 1}-${last + 1}`;
    outputs.push({ name: `${baseName}-${label}.pdf`, bytes: groupBytes });
  }

  return outputs;
}
