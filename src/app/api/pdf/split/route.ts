import {
  checkPdfRateLimit,
  checkFileBudget,
  collectFiles,
  errorResponse,
  fileResponse,
  internalErrorResponse,
  deriveFilename,
  PdfToolError,
} from "@/lib/pdf/apiHelpers";
import { validatePdfUpload, parseSplitGroups } from "@/lib/pdf/validation";
import { splitEveryPage, splitByGroups } from "@/lib/pdf/split";
import { buildZip } from "@/lib/pdf/zip";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "split-pdf");
  if (rateLimited) return rateLimited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Couldn't read the uploaded file.");
  }

  const files = collectFiles(formData, "files");
  const budget = checkFileBudget(files, { min: 1, max: 1 });
  if (!budget.ok) return errorResponse(budget.error ?? "Add one PDF file.");

  const file = files[0];
  if (!file) return errorResponse("Add one PDF file.");

  const validated = await validatePdfUpload(file);
  if (!validated.ok) return errorResponse(validated.error);

  const mode = formData.get("mode");
  const rangesInput = formData.get("ranges");
  const pageCount = validated.value.doc.getPageCount();
  const baseName = file.name.replace(/\.[^./]+$/, "") || "split";

  try {
    const outputs =
      mode === "ranges"
        ? await (async () => {
            const parsed = parseSplitGroups(typeof rangesInput === "string" ? rangesInput : "", pageCount);
            if (!parsed.ok) throw new PdfToolError(parsed.error);
            return splitByGroups(validated.value.bytes, parsed.value, baseName);
          })()
        : await splitEveryPage(validated.value.bytes, baseName);

    if (outputs.length === 1) {
      const only = outputs[0];
      if (only) return fileResponse(only.bytes, only.name, "application/pdf");
    }

    const zipBytes = await buildZip(outputs);
    return fileResponse(zipBytes, deriveFilename(file.name, "-split", "zip"), "application/zip");
  } catch (err) {
    if (err instanceof PdfToolError) return errorResponse(err.message);
    return internalErrorResponse();
  }
}
