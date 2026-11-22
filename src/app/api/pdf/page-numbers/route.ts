import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse, deriveFilename } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload } from "@/lib/pdf/validation";
import { addPageNumbers, type PageNumberPosition } from "@/lib/pdf/pageNumbers";

export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_POSITIONS: PageNumberPosition[] = [
  "bottom-center",
  "bottom-right",
  "bottom-left",
  "top-center",
  "top-right",
  "top-left",
];

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "add-page-numbers");
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

  const position = formData.get("position");
  const resolvedPosition = VALID_POSITIONS.includes(position as PageNumberPosition)
    ? (position as PageNumberPosition)
    : "bottom-center";

  const startAtRaw = Number(formData.get("startAt") ?? 1);
  const startAt = Number.isFinite(startAtRaw) && startAtRaw >= 0 ? Math.trunc(startAtRaw) : 1;

  const format = formData.get("format") === "n-of-total" ? "n-of-total" : "n";

  const validated = await validatePdfUpload(file);
  if (!validated.ok) return errorResponse(validated.error);

  try {
    const numbered = await addPageNumbers(validated.value.bytes, {
      position: resolvedPosition,
      startAt,
      format,
      fontSize: 11,
    });
    return fileResponse(numbered, deriveFilename(file.name, "-numbered"), "application/pdf");
  } catch {
    return internalErrorResponse();
  }
}
