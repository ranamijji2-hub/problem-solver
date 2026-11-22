import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse, deriveFilename } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload, parsePageSelection } from "@/lib/pdf/validation";
import { extractPages } from "@/lib/pdf/extractPages";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "extract-pdf-pages");
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

  const pagesInput = formData.get("pages");
  const selection = parsePageSelection(typeof pagesInput === "string" ? pagesInput : "", validated.value.doc.getPageCount());
  if (!selection.ok) return errorResponse(selection.error);

  try {
    const extracted = await extractPages(validated.value.bytes, selection.value);
    return fileResponse(extracted, deriveFilename(file.name, "-extracted"), "application/pdf");
  } catch {
    return internalErrorResponse();
  }
}
