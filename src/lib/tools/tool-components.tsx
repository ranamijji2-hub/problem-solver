import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ToolLoadingSkeleton } from "@/components/tools/ToolLoadingSkeleton";

/**
 * Client tool components are registered at module scope so Next.js can
 * statically analyze every dynamic import and create deterministic chunks.
 *
 * Do not create dynamic(...) inside the route component. Doing so creates a
 * new component type during rendering and prevents Next from treating the
 * imports as stable route-level chunks.
 */
export const toolComponents: Record<string, ComponentType> = {
  "calculators/percentage-calculator": dynamic(() => import("@/components/calculators/PercentageCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/age-calculator": dynamic(() => import("@/components/calculators/AgeCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/gpa-calculator": dynamic(() => import("@/components/calculators/GpaCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/cgpa-calculator": dynamic(() => import("@/components/calculators/CgpaCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/attendance-calculator": dynamic(() => import("@/components/calculators/AttendanceCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/date-calculator": dynamic(() => import("@/components/calculators/DateCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/bmi-calculator": dynamic(() => import("@/components/calculators/BmiCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "calculators/discount-calculator": dynamic(() => import("@/components/calculators/DiscountCalculator"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/compress-pdf": dynamic(() => import("@/components/pdf-tools/CompressPdfTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/merge-pdf": dynamic(() => import("@/components/pdf-tools/MergePdfTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/split-pdf": dynamic(() => import("@/components/pdf-tools/SplitPdfTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/jpg-to-pdf": dynamic(() => import("@/components/pdf-tools/ImagesToPdfTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/pdf-to-jpg": dynamic(() => import("@/components/pdf-tools/PdfToImagesTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/rotate-pdf": dynamic(() => import("@/components/pdf-tools/RotatePdfTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/extract-pdf-pages": dynamic(() => import("@/components/pdf-tools/ExtractPdfPagesTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "pdf-tools/add-page-numbers": dynamic(() => import("@/components/pdf-tools/PdfPageNumbersTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-compressor": dynamic(() => import("@/components/image-tools/ImageCompressorTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-resizer": dynamic(() => import("@/components/image-tools/ImageResizerTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-converter": dynamic(() => import("@/components/image-tools/ImageConverterTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-cropper": dynamic(() => import("@/components/image-tools/ImageCropperTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-rotator": dynamic(() => import("@/components/image-tools/ImageRotatorTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/image-optimizer": dynamic(() => import("@/components/image-tools/ImageOptimizerTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/jpg-to-png": dynamic(() => import("@/components/image-tools/JpgToPngTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/png-to-jpg": dynamic(() => import("@/components/image-tools/PngToJpgTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "image-tools/webp-converter": dynamic(() => import("@/components/image-tools/WebpConverterTool"), { loading: () => <ToolLoadingSkeleton /> }),
  "audio-tools/audio-compressor": dynamic(() => import("@/components/audio-tools/AudioCompressorTool"), { loading: () => <ToolLoadingSkeleton /> }),
};
