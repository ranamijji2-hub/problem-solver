import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse, deriveFilename } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload } from "@/lib/pdf/validation";
import { compressPdf } from "@/lib/pdf/compress";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "compress-pdf");
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

  try {
    const result = await compressPdf(validated.value.bytes);
    return fileResponse(result.bytes, deriveFilename(file.name, "-compressed"), "application/pdf", {
      "X-Original-Size": String(result.originalSize),
      "X-Compressed-Size": String(result.compressedSize),
    });
  } catch {
    return internalErrorResponse();
  }
}
