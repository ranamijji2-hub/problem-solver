import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse } from "@/lib/pdf/apiHelpers";
import { validateImageUpload } from "@/lib/pdf/validation";
import { imagesToPdf } from "@/lib/pdf/imagesToPdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "jpg-to-pdf");
  if (rateLimited) return rateLimited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Couldn't read the uploaded files.");
  }

  const files = collectFiles(formData, "files");
  const budget = checkFileBudget(files, { min: 1 });
  if (!budget.ok) return errorResponse(budget.error ?? "Add at least one image.");

  const images: { bytes: Uint8Array; kind: "jpg" | "png" }[] = [];
  for (const file of files) {
    const result = await validateImageUpload(file);
    if (!result.ok) return errorResponse(result.error);
    images.push(result.value);
  }

  try {
    const pdfBytes = await imagesToPdf(images);
    return fileResponse(pdfBytes, "images.pdf", "application/pdf");
  } catch {
    return internalErrorResponse();
  }
}
