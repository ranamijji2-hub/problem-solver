import type { ToolDefinition } from "./types";

// Phase 4: all 9 image tools run entirely client-side via the Canvas API
// (see src/lib/image/engine.ts) — no server round trip, no upload, so
// every one of them is genuinely free to run and private by construction.
// image-to-text (OCR) is intentionally left as "placeholder": it needs a
// real OCR approach, deferred per the MVP cost principle, and isn't part
// of Phase 4's 9-tool scope.

export const imageTools: ToolDefinition[] = [
  {
    slug: "image-compressor",
    category: "image-tools",
    name: "Image Compressor",
    shortDescription: "Shrink an image's file size with minimal visible quality loss.",
    longDescription:
      "Upload one or more images, set a quality level, and compress them — optionally converting to JPG or WebP for smaller results. Batch multiple images and download them individually or all at once as a ZIP.",
    status: "live",
    keywords: ["image compressor", "compress image", "reduce image size", "compress jpg", "compress png"],
    problemPhrases: ["my image file is too big", "compress a photo", "reduce photo file size"],
    runsClientSide: true,
    relatedSlugs: ["image-resizer", "image-optimizer"],
    faqs: [
      {
        question: "Why doesn't the quality slider shrink my PNG much?",
        answer:
          "PNG is a lossless format — quality only affects JPG and WebP output. To meaningfully shrink a PNG, convert it to JPG or WebP while compressing.",
      },
      {
        question: "Can I compress more than one image at once?",
        answer: "Yes — add multiple images and download the results individually or together as a ZIP.",
      },
    ],
  },
  {
    slug: "image-resizer",
    category: "image-tools",
    name: "Image Resizer",
    shortDescription: "Resize an image to exact pixel dimensions, a percentage, or a common preset size.",
    longDescription:
      "Resize by exact width and height (with an aspect-ratio lock so the other dimension updates automatically), by percentage, or from a list of common preset sizes.",
    status: "live",
    keywords: ["image resizer", "resize image", "change image dimensions", "resize photo"],
    problemPhrases: ["resize my image", "change photo dimensions", "resize photo for instagram"],
    runsClientSide: true,
    relatedSlugs: ["image-compressor", "image-cropper"],
    faqs: [
      {
        question: "What happens if I only enter a width?",
        answer:
          "With the aspect ratio lock on (the default), the height is calculated automatically to keep the image's proportions unchanged.",
      },
    ],
  },
  {
    slug: "image-converter",
    category: "image-tools",
    name: "Image Converter",
    shortDescription: "Convert an image between JPG, PNG, and WebP.",
    longDescription:
      "Upload any supported image and convert it to JPG, PNG, or WebP, with a quality control for the lossy formats.",
    status: "live",
    keywords: ["image converter", "convert image", "change image format"],
    problemPhrases: ["convert image format", "change a picture to a different format"],
    runsClientSide: true,
    relatedSlugs: ["jpg-to-png", "png-to-jpg", "webp-converter"],
    faqs: [
      {
        question: "Does converting to JPG lose transparency?",
        answer: "Yes — JPG has no transparency support. Any transparent areas are filled white. Use PNG or WebP to keep transparency.",
      },
    ],
  },
  {
    slug: "image-cropper",
    category: "image-tools",
    name: "Image Cropper",
    shortDescription: "Crop an image to a specific area, freely or to a common aspect ratio.",
    longDescription:
      "Drag the crop box directly on the image to select exactly the area you want, or lock it to a common aspect ratio like square or 16:9.",
    status: "live",
    keywords: ["image cropper", "crop image", "crop photo", "square crop"],
    problemPhrases: ["crop my photo", "crop image to square", "cut out part of an image"],
    runsClientSide: true,
    relatedSlugs: ["image-resizer", "image-rotator"],
    faqs: [
      {
        question: "Can I crop on my phone?",
        answer: "Yes — dragging the crop box and its corner handles works with touch as well as mouse input.",
      },
    ],
  },
  {
    slug: "image-rotator",
    category: "image-tools",
    name: "Image Rotator",
    shortDescription: "Rotate an image by 90°, 180°, or 270°, or flip it horizontally or vertically.",
    longDescription: "Fix a sideways or upside-down photo, or flip it as a mirror image, entirely in your browser.",
    status: "live",
    keywords: ["image rotator", "rotate image", "flip image", "rotate photo"],
    problemPhrases: ["my photo is sideways", "rotate a picture", "flip an image horizontally"],
    runsClientSide: true,
    relatedSlugs: ["image-cropper", "image-compressor"],
  },
  {
    slug: "image-optimizer",
    category: "image-tools",
    name: "Image Optimizer",
    shortDescription: "Automatically reduce an image's file size while keeping it looking right.",
    longDescription:
      "A one-click, rule-based pass: downscales oversized images, picks a sensible output format, and re-encodes at a quality built for normal viewing — no settings to configure.",
    status: "live",
    keywords: ["image optimizer", "optimize image", "auto compress image"],
    problemPhrases: ["optimize my image automatically", "make an image web-ready"],
    runsClientSide: true,
    relatedSlugs: ["image-compressor", "image-resizer"],
    faqs: [
      {
        question: "How is this different from the Image Compressor?",
        answer:
          "The Compressor gives you manual control over quality and format. The Optimizer makes those decisions for you automatically using a fixed set of rules — see the tool page for exactly what it does.",
      },
    ],
  },
  {
    slug: "jpg-to-png",
    category: "image-tools",
    name: "JPG to PNG",
    shortDescription: "Convert JPG images to PNG format.",
    status: "live",
    keywords: ["jpg to png", "convert jpg to png"],
    problemPhrases: ["convert jpg to png"],
    runsClientSide: true,
    relatedSlugs: ["png-to-jpg", "image-converter"],
  },
  {
    slug: "png-to-jpg",
    category: "image-tools",
    name: "PNG to JPG",
    shortDescription: "Convert PNG images to JPG format.",
    status: "live",
    keywords: ["png to jpg", "convert png to jpg"],
    problemPhrases: ["convert png to jpg"],
    runsClientSide: true,
    relatedSlugs: ["jpg-to-png", "image-converter"],
    faqs: [
      {
        question: "Will my transparent PNG look right as a JPG?",
        answer: "Transparent areas are filled white, since JPG doesn't support transparency.",
      },
    ],
  },
  {
    slug: "webp-converter",
    category: "image-tools",
    name: "WebP Converter",
    shortDescription: "Convert JPG or PNG images to the WebP format.",
    longDescription: "WebP usually produces smaller files than JPG or PNG at a similar visual quality, including support for transparency.",
    status: "live",
    keywords: ["webp converter", "convert to webp", "jpg to webp", "png to webp"],
    problemPhrases: ["convert image to webp", "make my images webp"],
    runsClientSide: true,
    relatedSlugs: ["image-converter", "image-optimizer"],
    faqs: [
      {
        question: "What if my browser can't create WebP images?",
        answer: "The tool detects this and shows a clear message — try a recent version of Chrome, Firefox, or Edge.",
      },
    ],
  },
  {
    slug: "image-to-text",
    category: "image-tools",
    name: "Image to Text",
    shortDescription: "Extract readable text from an image using OCR.",
    status: "placeholder",
    keywords: ["image to text", "ocr", "extract text from image"],
    problemPhrases: ["get text out of a picture", "convert screenshot to text"],
    runsClientSide: false,
    relatedSlugs: [],
    longDescription:
      "This tool uses optical character recognition and is planned for the OCR phase, once a free or low-cost OCR approach is selected — see the MVP cost principle in the project brief.",
  },
];
