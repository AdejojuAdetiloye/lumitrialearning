import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatStaffInstructorName, type StaffInstructor } from "@/lib/instructorDisplay";
import {
  formatSlotFamilyLine,
  formatSlotInNigeria,
  sortTimetableByWeekdayInFamilyZone,
} from "@/lib/familyTimezone";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

type AssignmentRow = {
  id: string;
  assignedAt: string;
  course: { id: string; slug: string; name: string };
  instructor: StaffInstructor & { id: string };
  child: {
    id: string;
    firstName: string;
    lastName: string;
    parent: {
      firstName: string;
      lastName: string;
      user: { email: string };
      country: string;
    };
    timetable: {
      id: string;
      title: string;
      startsAt: string;
      endsAt: string;
      meetingLink: string;
    }[];
  };
};

const InstructorDashboard = () => {
  const [rows, setRows] = useState<AssignmentRow[]>([]);

  const load = async () => {
    const data = await api.get<AssignmentRow[]>("/api/instructor/my-students");
    setRows(data);
  };

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Load failed"));
  }, []);

  return (
    <>
      <Helmet>
        <title>Instructor dashboard | Lumitria</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 pt-24 max-w-6xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Your students</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Children assigned to you by an admin or manager. Open each class link below — times show in the family&apos;s
                zone and in Nigeria (Lagos) for instructors.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">Back to site</Link>
            </Button>
          </div>

          {rows.length === 0 ? (
            <Card variant="elevated">
              <CardContent className="py-12 text-center text-muted-foreground">
                No students assigned yet. An admin or manager will link you to a child.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {rows.map((row) => {
                const p = row.child.parent;
                const country = p.country;
                return (
                  <Card key={row.id} variant="elevated" className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {row.child.firstName} {row.child.lastName}
                      </CardTitle>
                      <p className="text-sm font-semibold text-primary mt-1">
                        Program: {row.course.name}
                      </p>
                      <CardDescription>
                        <span className="text-foreground font-medium">
                          Instructor: {formatStaffInstructorName(row.instructor)}
                        </span>
                        <span className="block mt-1">
                          Parent: {p.firstName} {p.lastName} · {p.user.email}
                        </span>
                        <span className="block mt-1 capitalize">{country.replace(/-/g, " ")}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {row.child.timetable.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No class sessions scheduled yet.</p>
                      ) : (
                        <ul className="space-y-3">
                          {sortTimetableByWeekdayInFamilyZone(row.child.timetable, country).map((slot) => (
                            <li
                              key={slot.id}
                              className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                              <p className="font-semibold text-foreground">{slot.title}</p>
                              <p className="text-sm text-foreground/90">
                                Family:{" "}
                                <span className="font-medium">
                                  {formatSlotFamilyLine(slot.startsAt, slot.endsAt, country)}
                                </span>
                              </p>
                              <p className="text-sm text-primary font-semibold">
                                Nigeria (instructor): {formatSlotInNigeria(slot.startsAt, slot.endsAt)}
                              </p>
                              <a
                                href={slot.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                              >
                                Open meeting link <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default InstructorDashboard;
