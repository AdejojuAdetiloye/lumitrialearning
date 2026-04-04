import { cn } from "@/lib/utils";
import { groupInstructorsByProgram, type InstructorAssignmentDisplay } from "@/lib/instructorDisplay";

type Assignment = InstructorAssignmentDisplay & { id?: string };

type Props = {
  assignments: Assignment[] | undefined | null;
  className?: string;
  /** e.g. "Programs & instructors" */
  heading?: string;
  /** Tighter one-line summary (e.g. parent grid cards) */
  compact?: boolean;
  /** Use `false` on dark/brand cards so the label isn’t forced to muted gray */
  mutedLabel?: boolean;
};

export function InstructorAssignmentsBlock({
  assignments,
  className,
  heading = "Programs & instructors",
  compact,
  mutedLabel = true,
}: Props) {
  const groups = groupInstructorsByProgram(assignments);
  if (groups.length === 0) return null;

  if (compact) {
    const text = groups.map((g) => `${g.courseName}: ${g.instructorNames.join(", ")}`).join("; ");
    return (
      <p className={cn("text-sm text-foreground", className)}>
        <span className={cn(mutedLabel && "text-muted-foreground")}>{heading}: </span>
        {text}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{heading}</p>
      <ul className="list-none space-y-2 p-0 m-0 text-sm">
        {groups.map((g) => (
          <li key={g.courseId} className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
            <p className="font-medium text-foreground">{g.courseName}</p>
            <p className="text-muted-foreground mt-0.5">
              {g.instructorNames.length === 1 ? "Instructor: " : "Instructors: "}
              {g.instructorNames.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
