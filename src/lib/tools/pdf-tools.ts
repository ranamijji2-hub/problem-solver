import type { ToolDefinition } from "./types";

// Phase 3: all 8 PDF tools are now "live". Two naming notes, both made to
// avoid changing already-public URLs (see the "no duplicate URLs" rule):
// - "pdf-to-jpg" implements the brief's "PDF to Images" tool — pages
//   render as JPGs, and the slug/URL from Phase 1 is kept as-is.
// - "jpg-to-pdf" implements "Images to PDF" — it accepts JPG and PNG, and
//   the Phase 1 slug/URL is kept as-is; the display name was broadened.
// Three tools are new in Phase 3 and have no Phase 1 placeholder to
// preserve: rotate-pdf, extract-pdf-pages, add-page-numbers.

export const pdfTools: ToolDefinition[] = [
  {
    slug: "compress-pdf",
    category: "pdf-tools",
    name: "Compress PDF",
    shortDescription: "Reduce a PDF's file size while keeping it readable.",
    longDescription:
      "Shrinks a PDF's internal structure — shared objects, fonts, and cross-reference data — without changing how it looks. Works best on PDFs with many fonts or form fields; PDFs that are mostly scanned images will see smaller gains, since embedded image data isn't re-encoded.",
    status: "live",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf"],
    problemPhrases: ["my pdf is too large", "pdf file size too big to upload", "make pdf smaller"],
    runsClientSide: false,
    relatedSlugs: ["merge-pdf", "split-pdf"],
    faqs: [
      {
        question: "Why didn't my PDF get much smaller?",
        answer:
          "This tool compresses the PDF's structure, not embedded images. If your PDF is mostly scanned pages or photos, most of its size is already-compressed image data that this pass doesn't touch.",
      },
      {
        question: "Will compressing change how my PDF looks?",
        answer: "No — the visual content of every page is unchanged. Only the underlying file structure is optimized.",
      },
    ],
  },
  {
    slug: "merge-pdf",
    category: "pdf-tools",
    name: "Merge PDF",
    shortDescription: "Combine multiple PDF files into a single document, in the order you choose.",
    longDescription:
      "Upload two or more PDFs, put them in the order you want with the up/down arrows, and download one combined file.",
    status: "live",
    keywords: ["merge pdf", "combine pdf", "join pdf"],
    problemPhrases: ["join multiple pdfs", "combine pdf files into one"],
    runsClientSide: false,
    relatedSlugs: ["split-pdf", "compress-pdf"],
    faqs: [
      {
        question: "Is there a limit to how many PDFs I can merge?",
        answer: "You can merge up to 20 files in one request, with a combined size limit of 32MB.",
      },
    ],
  },
  {
    slug: "split-pdf",
    category: "pdf-tools",
    name: "Split PDF",
    shortDescription: "Split a PDF into multiple separate files — every page, or custom page ranges.",
    longDescription:
      "Split one PDF into several output files: either every page as its own file, or custom groups you define (e.g. \"1-3, 4, 5-7\" produces three files). If the result is more than one file, they're delivered together as a ZIP.",
    status: "live",
    keywords: ["split pdf", "separate pdf pages", "divide pdf"],
    problemPhrases: ["split pdf into separate files", "break a pdf into multiple files"],
    runsClientSide: false,
    relatedSlugs: ["merge-pdf", "extract-pdf-pages"],
    faqs: [
      {
        question: "What's the difference between Split PDF and Extract Pages?",
        answer:
          "Split PDF produces multiple output files (one per page, or per custom group). Extract Pages pulls specific pages into a single combined output file instead.",
      },
    ],
  },
  {
    slug: "jpg-to-pdf",
    category: "pdf-tools",
    name: "Images to PDF",
    shortDescription: "Turn one or more JPG or PNG images into a single PDF document.",
    longDescription:
      "Upload JPG or PNG images and get back one PDF with each image on its own page, in the order you added them.",
    status: "live",
    keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "png to pdf", "images to pdf"],
    problemPhrases: ["turn my photos into a pdf", "convert image to pdf", "combine photos into one pdf"],
    runsClientSide: false,
    relatedSlugs: ["pdf-to-jpg"],
    faqs: [
      {
        question: "Can I mix JPG and PNG images in one PDF?",
        answer: "Yes — add any combination of JPG and PNG files, in whatever order you want them to appear.",
      },
    ],
  },
  {
    slug: "pdf-to-jpg",
    category: "pdf-tools",
    name: "PDF to Images",
    shortDescription: "Convert every page of a PDF into a JPG image.",
    longDescription:
      "Renders each page of a PDF as a JPG image. A single-page PDF downloads as one JPG; multi-page PDFs download as a ZIP containing one JPG per page.",
    status: "live",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to images", "pdf to png"],
    problemPhrases: ["turn pdf pages into images", "convert pdf to jpg", "extract images from pdf"],
    runsClientSide: false,
    relatedSlugs: ["jpg-to-pdf"],
    faqs: [
      {
        question: "Is there a page limit?",
        answer: "Yes — up to 30 pages per PDF, since rendering pages to images is more resource-intensive than other PDF operations.",
      },
    ],
  },
  {
    slug: "rotate-pdf",
    category: "pdf-tools",
    name: "Rotate PDF",
    shortDescription: "Rotate every page of a PDF by 90°, 180°, or 270°.",
    longDescription:
      "Fixes a PDF that opens sideways or upside down. Rotation applies to every page by the same amount.",
    status: "live",
    keywords: ["rotate pdf", "turn pdf pages", "fix sideways pdf"],
    problemPhrases: ["my pdf is sideways", "rotate a scanned pdf", "pdf is upside down"],
    runsClientSide: false,
    relatedSlugs: ["compress-pdf"],
    faqs: [
      {
        question: "Can I rotate just one page instead of the whole document?",
        answer: "Not yet — this rotates every page by the same amount. Per-page rotation may come in a future update.",
      },
    ],
  },
  {
    slug: "extract-pdf-pages",
    category: "pdf-tools",
    name: "Extract PDF Pages",
    shortDescription: "Pull specific pages out of a PDF into a single new document.",
    longDescription:
      'Choose exactly which pages you need — e.g. "1, 3, 5-7" — and get back one new PDF containing just those pages, in their original order.',
    status: "live",
    keywords: ["extract pdf pages", "pull pages from pdf", "select pdf pages"],
    problemPhrases: ["extract pages from pdf", "get specific pages from a pdf", "remove pages from pdf"],
    runsClientSide: false,
    relatedSlugs: ["split-pdf", "merge-pdf"],
    faqs: [
      {
        question: "Can I use this to remove pages instead of keeping them?",
        answer: "List the pages you want to keep — anything not listed is left out, which has the same effect as removing it.",
      },
    ],
  },
  {
    slug: "add-page-numbers",
    category: "pdf-tools",
    name: "Add Page Numbers to PDF",
    shortDescription: "Stamp page numbers onto every page of a PDF.",
    longDescription:
      'Adds page numbers in the position and format you choose — plain numbers or "1 of 20" style — starting from any number you like.',
    status: "live",
    keywords: ["add page numbers to pdf", "number pdf pages", "pdf pagination"],
    problemPhrases: ["number the pages in my pdf", "add page numbers to a pdf"],
    runsClientSide: false,
    relatedSlugs: ["rotate-pdf", "merge-pdf"],
    faqs: [
      {
        question: "Can numbering start from something other than 1?",
        answer: 'Yes — set "Start numbering at" to any number, useful when this PDF continues from another document.',
      },
    ],
  },
];
