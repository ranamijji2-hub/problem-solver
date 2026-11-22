import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse, deriveFilename } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload } from "@/lib/pdf/validation";
import { pdfToImages } from "@/lib/pdf/pdfToImages";
import { buildZip } from "@/lib/pdf/zip";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rasterizing many pages at a useful resolution is memory- and CPU-heavy
// relative to the other PDF tools, so this route caps page count tighter
// than the general upload limits.
const MAX_PAGES_TO_RASTERIZE = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "pdf-to-jpg");
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

  if (validated.value.doc.getPageCount() > MAX_PAGES_TO_RASTERIZE) {
    return errorResponse(`This PDF has more than ${MAX_PAGES_TO_RASTERIZE} pages — that's over the limit for converting to images in one request.`);
  }

  try {
    const pages = await pdfToImages(validated.value.bytes);
    const baseName = file.name.replace(/\.[^./]+$/, "") || "page";

    if (pages.length === 1) {
      const only = pages[0];
      if (only) return fileResponse(only.bytes, `${baseName}.jpg`, "image/jpeg");
    }

    const zipBytes = await buildZip(
      pages.map((p) => ({ name: `${baseName}-page-${p.pageNumber}.jpg`, bytes: p.bytes }))
    );
    return fileResponse(zipBytes, deriveFilename(file.name, "-images", "zip"), "application/zip");
  } catch {
    return internalErrorResponse();
  }
}
