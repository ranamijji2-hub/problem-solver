import { checkPdfRateLimit, checkFileBudget, collectFiles, errorResponse, fileResponse, internalErrorResponse, deriveFilename } from "@/lib/pdf/apiHelpers";
import { validatePdfUpload } from "@/lib/pdf/validation";
import { rotatePdf, type RotationDegrees } from "@/lib/pdf/rotate";

export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_ROTATIONS = [90, 180, 270];

export async function POST(request: Request) {
  const rateLimited = checkPdfRateLimit(request, "rotate-pdf");
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

  const rotationRaw = Number(formData.get("rotation"));
  if (!VALID_ROTATIONS.includes(rotationRaw)) {
    return errorResponse("Choose a rotation of 90°, 180°, or 270°.");
  }

  const validated = await validatePdfUpload(file);
  if (!validated.ok) return errorResponse(validated.error);

  try {
    const rotated = await rotatePdf(validated.value.bytes, rotationRaw as RotationDegrees);
    return fileResponse(rotated, deriveFilename(file.name, "-rotated"), "application/pdf");
  } catch {
    return internalErrorResponse();
  }
}
