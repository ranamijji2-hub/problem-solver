import type { ToolDefinition } from "./types";

// Architecture decision (flagged for your approval — see chat summary):
// the brief lists Percentage, GPA/CGPA, and Attendance under both
// "Calculators" and "Student Tools". Per the "no duplicate URLs for the
// same tool" rule, those four already live under /calculators/* and are
// surfaced again on the /student-tools hub page as cross-category cards
// (see src/app/student-tools/page.tsx) rather than re-defined here with a
// second URL. Only the genuinely new tool — University Aggregate — gets a
// canonical /student-tools/* URL.
export const studentTools: ToolDefinition[] = [
  {
    slug: "university-aggregate-calculator",
    category: "student-tools",
    name: "University Aggregate Calculator",
    shortDescription: "Calculate your combined aggregate score across exams for university admission.",
    status: "placeholder",
    keywords: ["university aggregate calculator", "aggregate calculator", "admission aggregate"],
    problemPhrases: [
      "calculate my university aggregate",
      "aggregate for admission",
      "combine matric and fsc marks",
    ],
    runsClientSide: true,
    relatedSlugs: [],
  },
];

/**
 * Slugs of Calculators-category tools that are also relevant to students,
 * surfaced on the /student-tools hub without creating a second URL for the
 * same tool. See the architecture note above.
 */
export const studentRelevantCalculatorSlugs = [
  "percentage-calculator",
  "gpa-calculator",
  "cgpa-calculator",
  "attendance-calculator",
] as const;
