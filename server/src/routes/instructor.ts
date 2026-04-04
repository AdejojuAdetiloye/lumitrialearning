import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, requireRole(Role.INSTRUCTOR));

router.get("/my-students", async (req: AuthedRequest, res) => {
  const rows = await prisma.instructorAssignment.findMany({
    where: { instructorId: req.userId! },
    include: {
      instructor: { select: { id: true, email: true, staffProfile: true } },
      course: { select: { id: true, slug: true, name: true } },
      child: {
        include: {
          parent: {
            include: {
              user: { select: { email: true } },
            },
          },
          timetable: { orderBy: { startsAt: "asc" } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });
  return res.json(rows);
});

export default router;
