/**
 * Fixed sauce-inspired color block per category slug. Categories are fixed
 * for MVP (see CLAUDE.md), so this mapping lives in code rather than a DB column.
 */
const CATEGORY_COLOR_CLASSES: Record<string, string> = {
  financial: "bg-category-financial",
  "self-help": "bg-category-self-help",
  relational: "bg-category-relational",
  "leadership-development": "bg-category-leadership-development",
};

export function categoryBgClass(slug: string): string {
  return CATEGORY_COLOR_CLASSES[slug] ?? "bg-brand-navy";
}
