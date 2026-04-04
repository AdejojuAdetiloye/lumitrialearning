/** User + optional staff profile — matches API shapes for assigned instructors. */
export type StaffInstructor = {
  email: string;
  staffProfile: { firstName: string; lastName: string } | null;
};

export type CourseRef = { id?: string; slug?: string; name: string };

export type InstructorAssignmentDisplay = {
  course: CourseRef;
  instructor: StaffInstructor;
};

export type GroupedInstructorsByProgram = {
  courseId: string;
  courseName: string;
  instructorNames: string[];
};

/** Group assignments by program; multiple instructors for the same program appear together. */
export function groupInstructorsByProgram(
  assignments: InstructorAssignmentDisplay[] | undefined | null
): GroupedInstructorsByProgram[] {
  if (!assignments?.length) return [];
  const map = new Map<string, { courseName: string; names: string[] }>();
  for (const a of assignments) {
    const courseKey = a.course.id ?? a.course.name;
    const courseName = a.course.name;
    const inst = formatStaffInstructorName(a.instructor);
    const prev = map.get(courseKey);
    if (!prev) {
      map.set(courseKey, { courseName, names: [inst] });
    } else if (!prev.names.includes(inst)) {
      prev.names.push(inst);
    }
  }
  return [...map.entries()].map(([courseId, v]) => ({
    courseId,
    courseName: v.courseName,
    instructorNames: v.names,
  }));
}

export function formatStaffInstructorName(user: StaffInstructor): string {
  const sp = user.staffProfile;
  if (sp && (sp.firstName?.trim() || sp.lastName?.trim())) {
    return `${sp.firstName ?? ""} ${sp.lastName ?? ""}`.trim();
  }
  return user.email;
}

/** One segment per program; multiple instructors comma-separated: "Coding: Jane, Bob; STEM: Alex" */
export function formatInstructorsFromAssignments(
  assignments: InstructorAssignmentDisplay[] | undefined | null
): string | null {
  const groups = groupInstructorsByProgram(assignments);
  if (!groups.length) return null;
  return groups.map((g) => `${g.courseName}: ${g.instructorNames.join(", ")}`).join("; ");
}
