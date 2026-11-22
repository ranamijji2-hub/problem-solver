import type { ToolDefinition } from "./types";

// Phase 2: all 8 calculators are now "live" with a registered client component.
// Phase 1's plan held exactly: flipping status was the only registry change needed — routing, SEO, sitemap, and search
// all picked this up automatically.

export const calculatorTools: ToolDefinition[] = [
  {
    slug: "percentage-calculator",
    category: "calculators",
    name: "Percentage Calculator",
    shortDescription: "Find a percentage, a percentage change, or what number a percentage represents.",
    longDescription:
      "One calculator, four ways to think about percentages: what X% of a number is, what percentage one number is of another, the percentage increase or decrease between two values, and the percentage difference between them. Switch modes at the top — your numbers stay in place.",
    status: "live",
    keywords: ["percentage", "percent", "percentage calculator", "percent of", "percentage increase", "percentage decrease"],
    problemPhrases: [
      "425 out of 550 percentage",
      "what percentage is x of y",
      "calculate my percentage",
      "percentage increase or decrease",
      "20 percent of 150",
    ],
    runsClientSide: true,
    relatedSlugs: ["gpa-calculator", "attendance-calculator", "discount-calculator"],
    faqs: [
      {
        question: "Does this calculator round the result?",
        answer:
          "Results are shown to two decimal places by default; the underlying calculation is not rounded before display.",
      },
      {
        question: "Why can't I calculate percentage change from 0?",
        answer:
          "Percentage change needs a non-zero starting value to measure against — going from 0 to any number isn't a defined percentage increase.",
      },
    ],
  },
  {
    slug: "age-calculator",
    category: "calculators",
    name: "Age Calculator",
    shortDescription: "Calculate exact age in years, months, and days between two dates.",
    longDescription:
      "Enter a date of birth to get an exact, calendar-accurate age — not just a day count divided by 365. Handles leap years and leap-day birthdays correctly, and lets you calculate age as of any date, not only today.",
    status: "live",
    keywords: ["age", "age calculator", "how old", "date of birth calculator"],
    problemPhrases: ["how old am i", "calculate my age", "days until my birthday", "age from date of birth"],
    runsClientSide: true,
    relatedSlugs: ["date-calculator"],
    faqs: [
      {
        question: "Can I calculate my age as of a future or past date, not just today?",
        answer:
          "Yes — change the \"Calculate age as of\" field to any date. It defaults to today's date.",
      },
      {
        question: "What happens if I enter a future date of birth?",
        answer: "The calculator flags it as invalid — a date of birth can't be after the reference date.",
      },
    ],
  },
  {
    slug: "gpa-calculator",
    category: "calculators",
    name: "GPA Calculator",
    shortDescription: "Calculate your grade point average from course grades and credit hours.",
    longDescription:
      "Add every subject you're taking, along with its credit hours and grade, and get your credit-hour-weighted GPA on a standard 4.0 scale. Add or remove subjects freely — the result recalculates instantly.",
    status: "live",
    keywords: ["gpa", "gpa calculator", "grade point average", "weighted gpa"],
    problemPhrases: ["calculate my gpa", "what is my gpa", "gpa from grades and credit hours"],
    runsClientSide: true,
    relatedSlugs: ["cgpa-calculator"],
    faqs: [
      {
        question: "What grading scale does this use?",
        answer:
          "A standard 4.0 letter-grade scale (A/A+ = 4.0 down to F = 0.0). If your institution uses a different scale, treat the result as an estimate.",
      },
      {
        question: "Can I remove a subject I added by mistake?",
        answer: "Yes — use the trash icon next to any subject row. At least one subject must remain.",
      },
    ],
  },
  {
    slug: "cgpa-calculator",
    category: "calculators",
    name: "CGPA Calculator",
    shortDescription: "Calculate your cumulative GPA across multiple semesters.",
    longDescription:
      "Enter each semester's GPA and credit-hour total to get your cumulative, credit-hour-weighted CGPA across your whole academic record. Add as many semesters as you need.",
    status: "live",
    keywords: ["cgpa", "cgpa calculator", "cumulative gpa"],
    problemPhrases: ["calculate my cgpa", "what is my cgpa", "cumulative gpa across semesters"],
    runsClientSide: true,
    relatedSlugs: ["gpa-calculator"],
    faqs: [
      {
        question: "How is CGPA different from GPA here?",
        answer:
          "GPA (see the GPA Calculator) is computed from individual subject grades within one semester. CGPA is the credit-hour-weighted average of GPAs you've already calculated for each semester.",
      },
    ],
  },
  {
    slug: "attendance-calculator",
    category: "calculators",
    name: "Attendance Calculator",
    shortDescription: "Work out your current attendance percentage and how many classes you can miss.",
    longDescription:
      "Enter the classes you've had and attended, and your institution's required percentage, to see exactly where you stand — including how many more classes you can afford to miss, or need to attend, to hit that requirement.",
    status: "live",
    keywords: ["attendance", "attendance calculator", "attendance percentage", "bunk calculator"],
    problemPhrases: [
      "how many classes can i miss",
      "calculate my attendance percentage",
      "minimum attendance required",
      "classes needed to reach 75 percent attendance",
    ],
    runsClientSide: true,
    relatedSlugs: ["percentage-calculator"],
    faqs: [
      {
        question: "How is \"classes you can still miss\" calculated?",
        answer:
          "It's the number of additional classes, held from now on, that you could miss entirely and still end up at or above your target percentage — assuming you attend every other class.",
      },
      {
        question: "What if 100% attendance is required but I've already missed a class?",
        answer:
          "The calculator flags this as no longer reachable: once a class is missed, a 100% target can't be regained, only approached.",
      },
    ],
  },
  {
    slug: "date-calculator",
    category: "calculators",
    name: "Date Calculator",
    shortDescription: "Add or subtract days from a date, or find the number of days between two dates.",
    longDescription:
      "Three tools in one: find the calendar-accurate difference between two dates, or add/subtract a number of days from a date to find a resulting date — useful for deadlines, due dates, and planning.",
    status: "live",
    keywords: ["date calculator", "days between dates", "add days to date", "subtract days from date"],
    problemPhrases: ["how many days between two dates", "what date is 30 days from now", "days until a deadline"],
    runsClientSide: true,
    relatedSlugs: ["age-calculator"],
    faqs: [
      {
        question: "Does this account for leap years?",
        answer: "Yes — all calculations use real calendar months and days, including February 29 in leap years.",
      },
    ],
  },
  {
    slug: "bmi-calculator",
    category: "calculators",
    name: "BMI Calculator",
    shortDescription: "Calculate body mass index from height and weight.",
    longDescription:
      "Enter your weight and height in metric or imperial units to get your BMI and general category. BMI is a broad screening measure, not a diagnosis — it doesn't account for muscle mass, bone density, age, or sex.",
    status: "live",
    keywords: ["bmi", "bmi calculator", "body mass index"],
    problemPhrases: ["calculate my bmi", "am i a healthy weight", "bmi in kg and cm"],
    runsClientSide: true,
    relatedSlugs: [],
    faqs: [
      {
        question: "Is BMI a medical diagnosis?",
        answer:
          "No. BMI is a general screening indicator based only on weight and height. It doesn't account for muscle mass, bone density, age, sex, or overall health. For guidance specific to you, talk to a healthcare professional.",
      },
      {
        question: "Can I switch between metric and imperial units?",
        answer: "Yes — toggle weight between kg/lb and height between cm and feet/inches independently.",
      },
    ],
  },
  {
    slug: "discount-calculator",
    category: "calculators",
    name: "Discount Calculator",
    shortDescription: "Find the sale price and the amount saved for any percentage-off discount.",
    longDescription:
      "Enter an original price and a discount percentage to see the discount amount and final price instantly. Optionally add a tax rate, applied after the discount, for a real out-the-door total.",
    status: "live",
    keywords: ["discount calculator", "sale price", "percent off", "final price after discount"],
    problemPhrases: ["how much is 30 percent off", "calculate discount price", "sale price after discount and tax"],
    runsClientSide: true,
    relatedSlugs: ["percentage-calculator"],
    faqs: [
      {
        question: "Is tax applied before or after the discount?",
        answer: "After — tax is calculated on the discounted price, which matches how most retail discounts are taxed.",
      },
    ],
  },
];
