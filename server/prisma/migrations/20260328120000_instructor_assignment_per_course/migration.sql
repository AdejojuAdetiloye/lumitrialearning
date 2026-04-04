-- Per-subject instructor: each row is child + course + instructor.
-- Legacy rows had no subject; clear them (re-assign in admin after deploy).
DELETE FROM "InstructorAssignment";

DROP INDEX "InstructorAssignment_childId_instructorId_key";

ALTER TABLE "InstructorAssignment" ADD COLUMN "courseId" TEXT NOT NULL;

ALTER TABLE "InstructorAssignment" ADD CONSTRAINT "InstructorAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "InstructorAssignment_childId_courseId_key" ON "InstructorAssignment"("childId", "courseId");
