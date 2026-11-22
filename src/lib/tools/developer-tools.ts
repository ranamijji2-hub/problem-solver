import type { ToolDefinition } from "./types";

export const developerTools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    category: "developer-tools",
    name: "JSON Formatter",
    shortDescription: "Pretty-print and indent minified or messy JSON.",
    status: "placeholder",
    keywords: ["json formatter", "format json", "pretty print json", "beautify json"],
    problemPhrases: ["my json is unreadable", "format this json"],
    runsClientSide: true,
    relatedSlugs: ["json-validator"],
  },
  {
    slug: "json-validator",
    category: "developer-tools",
    name: "JSON Validator",
    shortDescription: "Check whether a JSON document is valid and see exactly where it breaks.",
    status: "placeholder",
    keywords: ["json validator", "validate json", "json syntax check"],
    problemPhrases: ["why is my json invalid", "check json syntax"],
    runsClientSide: true,
    relatedSlugs: ["json-formatter"],
  },
];
