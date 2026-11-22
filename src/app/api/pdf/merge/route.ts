import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload } from "@/lib/pdf/validation";
import { mergePdfs } from "@/lib/pdf/merge";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "merge-pdf");
  if (rateLimited) return rateLimited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Couldn't read the uploaded files.");
  }

  const files = collectFiles(formData, "files");
  const budget = checkFileBudget(files, { min: 2 });
  if (!budget.ok) return errorResponse(budget.error ?? "Invalid upload.");

  const pdfBytesList: Uint8Array[] = [];
  for (const file of files) {
    const result = await validatePdfUpload(file);
    if (!result.ok) return errorResponse(result.error);
    pdfBytesList.push(result.value.bytes);
  }

  try {
    const merged = await mergePdfs(pdfBytesList);
    return fileResponse(merged, "merged.pdf", "application/pdf");
  } catch {
    return internalErrorResponse();
  }
}
