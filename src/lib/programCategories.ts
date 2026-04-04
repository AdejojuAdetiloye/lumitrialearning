/**
 * Canonical program list — must match the homepage “Our Programs” section
 * (`CoursesSection`) and database courses (seed / pricing).
 */
export type ProgramColorKey = "primary" | "secondary" | "accent";

export type ProgramCategory = {
  slug: string;
  title: string;
  description: string;
  ages: string;
  color: ProgramColorKey;
  features: readonly string[];
};

export const PROGRAM_CATEGORIES: readonly ProgramCategory[] = [
  {
    slug: "coding",
    title: "Coding & Programming",
    description:
      "Learn to build games, apps, and websites using Scratch, Python, HTML/CSS, and advanced frameworks.",
    ages: "All Ages",
    color: "primary",
    features: ["Game Design", "Python & JavaScript", "Web Development"],
  },
  {
    slug: "stem",
    title: "STEM Excellence",
    description:
      "Explore science, technology, engineering, and mathematics through hands-on projects and real-world applications.",
    ages: "All Ages",
    color: "secondary",
    features: ["Robotics", "Science Projects", "Math Mastery"],
  },
  {
    slug: "culture",
    title: "African Culture",
    description:
      "Connect with Nigerian heritage through language, history, and traditions. Perfect for all ages.",
    ages: "All Ages",
    color: "accent",
    features: ["Yoruba/Igbo/Hausa", "History", "Traditions"],
  },
  {
    slug: "arts",
    title: "Creative Arts",
    description:
      "Express creativity through digital art, music, and storytelling. Suitable for beginners to advanced learners.",
    ages: "All Ages",
    color: "primary",
    features: ["Digital Art", "Music", "Creative Writing"],
  },
] as const;

/** Marketing line for dashboards (same order as the homepage). */
export const PROGRAM_CATEGORIES_SUMMARY =
  "Coding & Programming, STEM Excellence, African Culture, and Creative Arts";

/** Rows for Prisma course seed — titles/descriptions stay aligned with the homepage. */
export function coursesForSeed(): { slug: string; name: string; description: string }[] {
  return PROGRAM_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.title,
    description: c.description,
  }));
}
