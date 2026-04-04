-- Allow multiple instructors per child per program; keep one row per (child, program, instructor).
DROP INDEX IF EXISTS "InstructorAssignment_childId_courseId_key";

CREATE UNIQUE INDEX "InstructorAssignment_childId_courseId_instructorId_key" ON "InstructorAssignment"("childId", "courseId", "instructorId");
