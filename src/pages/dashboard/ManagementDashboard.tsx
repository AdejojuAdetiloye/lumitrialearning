import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { AdminDashboardNav } from "@/components/dashboard/AdminDashboardNav";
import { InstructorAssignmentsBlock } from "@/components/dashboard/InstructorAssignmentsBlock";
import { PROGRAM_CATEGORIES_SUMMARY } from "@/lib/programCategories";
import {
  familyWallEndToUtc,
  getFamilyTimezoneConfig,
  formatSlotFamilyLine,
  formatSlotInNigeria,
  nextLocalDateForIsoWeekday,
  sortTimetableByWeekdayInFamilyZone,
  wallClockInFamilyZoneToUtc,
} from "@/lib/familyTimezone";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Overview = {
  parentsCount: number;
  childrenCount: number;
  totalPaid: string;
  activeSubscriptions: number;
};

type ParentRow = {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  /** Server: at least one ACTIVE subscription overlaps the current calendar month (UTC). */
  paidCurrentMonth: boolean;
  user: { email: string; createdAt: string };
  children: {
    id: string;
    firstName: string;
    lastName: string;
    subscriptions: {
      status: string;
      tier: string;
      currentPeriodEnd: string;
      course: { id: string; name: string };
    }[];
    timetable: { id: string; title: string; startsAt: string; endsAt: string; meetingLink: string }[];
    instructorAssignments?: {
      id: string;
      course: { id: string; slug: string; name: string };
      instructor: {
        id: string;
        email: string;
        staffProfile: { firstName: string; lastName: string } | null;
      };
    }[];
  }[];
};

type ParentPaymentFilter = "all" | "paid" | "unpaid";

type PaymentRow = {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  paypalOrderId: string | null;
  user: { email: string };
  lines: { child: { firstName: string; lastName: string }; course: { name: string }; tier: string; amount: string }[];
};

type TierPriceRow = {
  id: string;
  country: string;
  tier: string;
  amount: string;
  currency: string;
};

type StaffUserRow = {
  id: string;
  email: string;
  role: string;
  staffProfile: { firstName: string; lastName: string } | null;
};

type InstructorListRow = {
  id: string;
  email: string;
  staffProfile: { firstName: string; lastName: string } | null;
};

type CatalogCourse = { id: string; slug: string; name: string; description: string | null };

/** Full parent + children detail (subscriptions + timetables) — shared with modal. */
function ParentFamilyDetail({ p }: { p: ParentRow }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-gradient-to-br from-muted/40 to-muted/10 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Parent</p>
          <span
            className={
              p.paidCurrentMonth
                ? "text-[10px] font-semibold uppercase tracking-wide rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 border border-emerald-500/30"
                : "text-[10px] font-semibold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 px-2 py-0.5 border border-amber-500/30"
            }
          >
            {p.paidCurrentMonth ? "Paid this month" : "Not paid this month"}
          </span>
        </div>
        <p className="text-lg font-semibold tracking-tight text-foreground mt-1">
          {p.firstName} {p.lastName}
        </p>
        <p className="text-sm text-muted-foreground mt-1 break-all">{p.user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex rounded-full border border-border/80 bg-background px-2.5 py-0.5 font-medium capitalize">
            {p.country.replace(/-/g, " ")}
          </span>
          <span className="text-muted-foreground">
            Joined {new Date(p.user.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {p.children.map((c) => (
        <div key={c.id} className="rounded-xl border border-border bg-muted/15 p-4 space-y-3">
          <p className="font-semibold text-foreground flex flex-wrap items-center gap-2">
            Child: {c.firstName} {c.lastName}
            <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground font-normal">
              id: {c.id}
            </span>
          </p>
          <InstructorAssignmentsBlock assignments={c.instructorAssignments} />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Subscriptions</p>
            <ul className="mt-1 list-disc pl-5 space-y-0.5 text-sm">
              {c.subscriptions.length === 0 ? (
                <li>None</li>
              ) : (
                c.subscriptions.map((s, i) => (
                  <li key={i}>
                    {s.course.name} · {s.tier} · next: {new Date(s.currentPeriodEnd).toLocaleString()}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Timetable ({c.timetable.length})
            </p>
            {c.timetable.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-1">No sessions yet.</p>
            ) : (
              <ul className="mt-2 space-y-3 text-xs sm:text-sm">
                {sortTimetableByWeekdayInFamilyZone(c.timetable, p.country).map((slot) => (
                  <li
                    key={slot.id}
                    className="rounded-lg border border-border bg-background/80 p-3 space-y-1.5"
                  >
                    <p className="font-semibold text-foreground text-sm sm:text-base">{slot.title}</p>
                    <p className="text-xs sm:text-sm text-foreground/90">
                      Family time:{" "}
                      <span className="font-medium">
                        {formatSlotFamilyLine(slot.startsAt, slot.endsAt, p.country)}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-primary font-semibold">
                      Instructor (Nigeria): {formatSlotInNigeria(slot.startsAt, slot.endsAt)}
                    </p>
                    <a
                      href={slot.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-primary underline-offset-2 hover:underline inline-block"
                    >
                      Meeting link
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ManagementDashboard({ isAdmin }: { isAdmin: boolean }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [tierPrices, setTierPrices] = useState<TierPriceRow[]>([]);
  const [tierDraft, setTierDraft] = useState<Record<string, string>>({});
  const [staffUsers, setStaffUsers] = useState<StaffUserRow[]>([]);
  const [instructors, setInstructors] = useState<InstructorListRow[]>([]);
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
    role: "INSTRUCTOR" as "MANAGER" | "INSTRUCTOR",
    firstName: "",
    lastName: "",
  });
  const [assignChildId, setAssignChildId] = useState("");
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignInstructorId, setAssignInstructorId] = useState("");
  const [courseCatalog, setCourseCatalog] = useState<CatalogCourse[]>([]);
  const [newCourseSlug, setNewCourseSlug] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedParent, setSelectedParent] = useState<ParentRow | null>(null);
  const [parentPaymentFilter, setParentPaymentFilter] = useState<ParentPaymentFilter>("all");

  const [tt, setTt] = useState({
    childId: "",
    title: "",
    weekdayIso: "2", // default Tuesday (ISO: 1=Mon,...,7=Sun)
    startTime: "15:00",
    endTime: "16:00",
    meetingLink: "",
  });

  const parentCountryForChild = (childId: string) => {
    for (const pa of parents) {
      const c = pa.children.find((ch) => ch.id === childId);
      if (c) return pa.country;
    }
    return null as string | null;
  };

  /** Loaded separately so admin list failures don’t leave the program dropdown empty. */
  const loadCourseCatalog = useCallback(async () => {
    try {
      const courses = await api.get<CatalogCourse[] | unknown>("/api/admin/courses");
      setCourseCatalog(Array.isArray(courses) ? courses : []);
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not load programs. Sign in as admin or manager and ensure /api/admin/courses is reachable."
      );
      setCourseCatalog([]);
    }
  }, []);

  const load = async () => {
    const [o, p, pay, inst] = await Promise.all([
      api.get<Overview>("/api/admin/overview"),
      api.get<ParentRow[]>("/api/admin/parents"),
      api.get<PaymentRow[]>("/api/admin/payments"),
      api.get<InstructorListRow[]>("/api/admin/instructors"),
    ]);
    setOverview(o);
    setParents(p);
    setPayments(pay);
    setInstructors(inst);
    if (isAdmin) {
      const [tp, staff] = await Promise.all([
        api.get<TierPriceRow[]>("/api/admin/tier-prices"),
        api.get<StaffUserRow[]>("/api/admin/staff-users"),
      ]);
      setTierPrices(tp);
      const draft: Record<string, string> = {};
      for (const r of tp) draft[r.id] = String(Number(r.amount));
      setTierDraft(draft);
      setStaffUsers(staff);
    } else {
      setTierPrices([]);
      setTierDraft({});
      setStaffUsers([]);
    }
    await loadCourseCatalog();
  };

  useEffect(() => {
    void loadCourseCatalog();
  }, [loadCourseCatalog]);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Load failed"));
  }, [isAdmin]);

  const assignmentRows = useMemo(() => {
    const rows: { assignmentId: string; programLabel: string; childLabel: string; instructorLabel: string }[] = [];
    for (const pa of parents) {
      for (const c of pa.children) {
        for (const a of c.instructorAssignments ?? []) {
          const name = a.instructor.staffProfile
            ? `${a.instructor.staffProfile.firstName} ${a.instructor.staffProfile.lastName}`
            : a.instructor.email;
          rows.push({
            assignmentId: a.id,
            programLabel: a.course.name,
            childLabel: `${c.firstName} ${c.lastName} (${pa.firstName} ${pa.lastName})`,
            instructorLabel: name,
          });
        }
      }
    }
    return rows;
  }, [parents]);

  const submitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/staff-users", {
        email: staffForm.email.trim(),
        password: staffForm.password,
        role: staffForm.role,
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
      });
      toast.success("Staff account created");
      setStaffForm({ email: "", password: "", role: "INSTRUCTOR", firstName: "", lastName: "" });
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignChildId || !assignCourseId || !assignInstructorId) {
      toast.error("Select a child, program, and an instructor");
      return;
    }
    try {
      await api.post("/api/admin/instructor-assignments", {
        childId: assignChildId,
        courseId: assignCourseId,
        instructorId: assignInstructorId,
      });
      toast.success("Instructor added for this program (assign another to add co-instructors).");
      setAssignInstructorId("");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const submitNewCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newCourseSlug.trim().toLowerCase();
    if (!slug || !newCourseName.trim()) {
      toast.error("Slug and name are required");
      return;
    }
    try {
      await api.post("/api/admin/courses", {
        slug,
        name: newCourseName.trim(),
        description: newCourseDescription.trim() || null,
      });
      toast.success("Program created");
      setNewCourseSlug("");
      setNewCourseName("");
      setNewCourseDescription("");
      await loadCourseCatalog();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const beginEditCourse = (c: CatalogCourse) => {
    setEditingCourseId(c.id);
    setEditSlug(c.slug);
    setEditName(c.name);
    setEditDescription(c.description ?? "");
  };

  const submitEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId) return;
    const slug = editSlug.trim().toLowerCase();
    if (!slug || !editName.trim()) {
      toast.error("Slug and name are required");
      return;
    }
    try {
      await api.put(`/api/admin/courses/${editingCourseId}`, {
        slug,
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      toast.success("Program updated");
      setEditingCourseId(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await api.delete(`/api/admin/courses/${id}`);
      toast.success("Program deleted");
      await loadCourseCatalog();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete program");
    }
  };

  const removeAssignment = async (id: string) => {
    try {
      await api.delete(`/api/admin/instructor-assignments/${id}`);
      toast.success("Assignment removed");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const submitTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    const country = parentCountryForChild(tt.childId);
    if (!country) {
      toast.error("Select a child first");
      return;
    }
    try {
      const isoWeekday = Number(tt.weekdayIso || "2");
      const sessionDate = nextLocalDateForIsoWeekday(country, isoWeekday);
      const startUtc = wallClockInFamilyZoneToUtc(sessionDate, tt.startTime, country);
      const endUtc = familyWallEndToUtc(sessionDate, tt.endTime, country, startUtc);
      await api.post("/api/admin/timetable", {
        childId: tt.childId,
        title: tt.title,
        startsAt: startUtc.toISOString(),
        endsAt: endUtc.toISOString(),
        meetingLink: tt.meetingLink,
      });
      toast.success("Timetable entry created");
      setTt({
        childId: "",
        title: "",
        weekdayIso: "2",
        startTime: "15:00",
        endTime: "16:00",
        meetingLink: "",
      });
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const allChildOptions = parents.flatMap((pa) =>
    pa.children.map((c) => ({
      id: c.id,
      label: `${pa.firstName} ${pa.lastName} → ${c.firstName} ${c.lastName}`,
    }))
  );

  const selectedCountry = tt.childId ? parentCountryForChild(tt.childId) : null;
  const selectedTz = selectedCountry ? getFamilyTimezoneConfig(selectedCountry) : null;

  const parentFilterCounts = useMemo(() => {
    const paid = parents.filter((p) => p.paidCurrentMonth).length;
    return { all: parents.length, paid, unpaid: parents.length - paid };
  }, [parents]);

  const filteredParents = useMemo(() => {
    if (parentPaymentFilter === "all") return parents;
    if (parentPaymentFilter === "paid") return parents.filter((p) => p.paidCurrentMonth);
    return parents.filter((p) => !p.paidCurrentMonth);
  }, [parents, parentPaymentFilter]);

  const billingMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date()),
    [],
  );

  return (
    <>
      <Helmet>
        <title>{isAdmin ? "Admin" : "Manager"} dashboard | Lumitria</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col scroll-smooth">
        <Header />
        <main className="flex-1 container mx-auto max-w-7xl scroll-smooth px-3 py-8 pt-20 sm:px-4 sm:py-10 sm:pt-24 md:px-6 space-y-8 sm:space-y-10">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {isAdmin ? "Admin control centre" : "Manager dashboard"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              {isAdmin
                ? "Use the sidebar (desktop) or chips (mobile) to jump to any section. Flow: families → assignments & timetable → payments → catalog, staff, and pricing."
                : "Use On this page to jump around. Managers handle families, instructor assignments, timetables, and payments."}
            </p>
          </header>

          {overview && (
            <section id="overview" className="scroll-mt-24 sm:scroll-mt-28 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Card className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Parents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">{overview.parentsCount}</p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Children
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">{overview.childrenCount}</p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Active subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    {overview.activeSubscriptions}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Total paid (completed)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold tracking-tight tabular-nums sm:text-2xl break-all">
                    {overview.totalPaid}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:gap-10">
            <AdminDashboardNav isAdmin={isAdmin} />
            <div className="min-w-0 w-full flex-1 space-y-10 sm:space-y-12 lg:space-y-14">
          <section id="parents" className="scroll-mt-24 space-y-4 sm:scroll-mt-28">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Parents & families</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Click a parent for full details. &quot;Paid&quot; means at least one active subscription covers{" "}
                  <span className="font-medium text-foreground">{billingMonthLabel}</span> (monthly billing window, UTC).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant={parentPaymentFilter === "all" ? "default" : "outline"}
                  onClick={() => setParentPaymentFilter("all")}
                >
                  All ({parentFilterCounts.all})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={parentPaymentFilter === "paid" ? "default" : "outline"}
                  className={parentPaymentFilter === "paid" ? "bg-emerald-600 hover:bg-emerald-600/90" : ""}
                  onClick={() => setParentPaymentFilter("paid")}
                >
                  Paid ({parentFilterCounts.paid})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={parentPaymentFilter === "unpaid" ? "default" : "outline"}
                  className={parentPaymentFilter === "unpaid" ? "bg-amber-600 hover:bg-amber-600/90" : ""}
                  onClick={() => setParentPaymentFilter("unpaid")}
                >
                  Not paid ({parentFilterCounts.unpaid})
                </Button>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
              {filteredParents.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedParent(p)}
                    className="group w-full min-w-0 text-left rounded-xl border border-white/20 bg-gradient-to-br from-primary via-[hsl(21_90%_40%)] to-[hsl(21_88%_32%)] p-4 shadow-md shadow-primary/20 transition-all hover:border-white/35 hover:shadow-lg hover:shadow-primary/35 hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold tracking-tight text-white">
                            {p.firstName} {p.lastName}
                          </p>
                          <span
                            className={
                              p.paidCurrentMonth
                                ? "text-[10px] font-bold uppercase tracking-wide rounded-full bg-emerald-400/30 text-white px-2 py-0.5 border border-emerald-200/50"
                                : "text-[10px] font-bold uppercase tracking-wide rounded-full bg-black/20 text-white px-2 py-0.5 border border-white/35"
                            }
                          >
                            {p.paidCurrentMonth ? "Paid" : "Not paid"}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-xs text-white/90 sm:text-sm">{p.user.email}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium rounded-full bg-white/20 px-2.5 py-0.5 capitalize border border-white/30 text-white">
                            {p.country.replace(/-/g, " ")}
                          </span>
                          <span className="text-xs text-white/80">
                            Joined {new Date(p.user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-white/85">
                          {p.children.length} child{p.children.length === 1 ? "" : "ren"}
                        </p>
                        {p.children.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-left list-none p-0 max-h-28 overflow-y-auto border-t border-white/15 pt-2">
                            {p.children.map((c) => (
                                <li key={c.id} className="text-[11px] leading-snug">
                                  <span className="font-medium text-white">
                                    {c.firstName} {c.lastName}
                                  </span>
                                  <InstructorAssignmentsBlock
                                    assignments={c.instructorAssignments}
                                    compact
                                    heading="Programs"
                                    mutedLabel={false}
                                    className="text-[11px] text-white/90 mt-0.5"
                                  />
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {parents.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No parents registered yet.</p>
            )}
            {parents.length > 0 && filteredParents.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 rounded-lg border border-dashed border-border px-4 py-6 text-center">
                No parents match this filter. Try &quot;All&quot; to see everyone.
              </p>
            )}
          </section>

          <section id="assignments" className="scroll-mt-24 sm:scroll-mt-28">
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="space-y-1.5 p-4 sm:p-6">
              <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Instructor assignments</CardTitle>
              <CardDescription>
                Select a child and program, then add an instructor. You can assign several instructors to the same
                program for one child (co-teaching or multiple sections). Reference: {PROGRAM_CATEGORIES_SUMMARY}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              <form onSubmit={submitAssignment} className="grid max-w-full gap-3 sm:max-w-xl">
                <div>
                  <Label>Child</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={assignChildId}
                    onChange={(e) => {
                      setAssignChildId(e.target.value);
                      setAssignCourseId("");
                    }}
                  >
                    <option value="">Select…</option>
                    {allChildOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Program</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={assignCourseId}
                    onChange={(e) => setAssignCourseId(e.target.value)}
                    disabled={courseCatalog.length === 0}
                    aria-label="Program to assign"
                  >
                    <option value="">
                      {courseCatalog.length === 0 ? "No programs loaded — check API or run db seed" : "Select program…"}
                    </option>
                    {courseCatalog.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lists all programs from the catalog. Reuse the same child + program and pick another instructor to add
                    a second assignment.
                  </p>
                </div>
                <div>
                  <Label>Instructor</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={assignInstructorId}
                    onChange={(e) => setAssignInstructorId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {instructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.staffProfile
                          ? `${ins.staffProfile.firstName} ${ins.staffProfile.lastName} (${ins.email})`
                          : ins.email}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="secondary">
                  Assign instructor
                </Button>
              </form>
              {assignmentRows.length > 0 && (
                <div className="-mx-1 w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-border sm:mx-0">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2">Program</th>
                        <th className="px-3 py-2">Child</th>
                        <th className="px-3 py-2">Instructor</th>
                        <th className="px-3 py-2 w-24" />
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentRows.map((row) => (
                        <tr key={row.assignmentId} className="border-t border-border">
                          <td className="px-3 py-2 font-medium">{row.programLabel}</td>
                          <td className="px-3 py-2">{row.childLabel}</td>
                          <td className="px-3 py-2">{row.instructorLabel}</td>
                          <td className="px-3 py-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(row.assignmentId)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          </section>

          <section id="timetable" className="scroll-mt-24 sm:scroll-mt-28">
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="space-y-1.5 p-4 sm:p-6">
              <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                Add class to a child&apos;s timetable
              </CardTitle>
              <CardDescription>
                Day and clock times use the parent&apos;s country on their profile (Canada, US, UK, or Nigeria). US and
                Canada use Eastern Time so scheduling stays consistent. Times are stored precisely; parents and children
                see the family&apos;s local schedule, and you see the same plus Nigeria time below for instructors.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <form onSubmit={submitTimetable} className="grid max-w-full gap-3 sm:max-w-xl">
                <div>
                  <Label>Child</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={tt.childId}
                    onChange={(e) => setTt({ ...tt, childId: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {allChildOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedTz && (
                  <p className="text-sm font-medium text-primary rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
                    Scheduling in: {selectedTz.scheduleLabel}
                  </p>
                )}
                <div>
                  <Label>Title</Label>
                  <Input value={tt.title} onChange={(e) => setTt({ ...tt, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Weekly class day</Label>
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={tt.weekdayIso}
                    onChange={(e) => setTt({ ...tt, weekdayIso: e.target.value })}
                    required
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="7">Sunday</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label>Start time</Label>
                    <Input
                      type="time"
                      value={tt.startTime}
                      onChange={(e) => setTt({ ...tt, startTime: e.target.value })}
                      required
                      className="min-h-11"
                    />
                  </div>
                  <div>
                    <Label>End time</Label>
                    <Input
                      type="time"
                      value={tt.endTime}
                      onChange={(e) => setTt({ ...tt, endTime: e.target.value })}
                      required
                      className="min-h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label>Meeting link</Label>
                  <Input type="url" value={tt.meetingLink} onChange={(e) => setTt({ ...tt, meetingLink: e.target.value })} required placeholder="https://zoom.us/j/..." />
                </div>
                <Button type="submit" variant="hero">Save session</Button>
              </form>
            </CardContent>
          </Card>
          </section>

          <section id="payments" className="scroll-mt-24 sm:scroll-mt-28">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Payments</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Review completed and in-progress payments, including which child and program each line belongs to.
              </p>
            </div>
            <div className="-mx-1 w-full min-w-0 overflow-x-auto overscroll-x-contain sm:mx-0">
              <table className="w-full min-w-[640px] text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3 sm:text-[11px]">
                      Date
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3 sm:text-[11px]">
                      Parent
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3 sm:text-[11px]">
                      Amount
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3 sm:text-[11px]">
                      Status
                    </th>
                    <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3 sm:text-[11px]">
                      Lines
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-border/80 bg-background/60">
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] sm:px-3 sm:text-xs md:text-sm">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="max-w-[140px] break-words px-2 py-2 text-[11px] sm:max-w-none sm:px-3 sm:text-xs md:text-sm">
                        {p.user.email}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] font-semibold sm:px-3 sm:text-xs md:text-sm">
                        {p.totalAmount} {p.currency}
                      </td>
                      <td className="px-2 py-2 sm:px-3">
                        <span className="inline-flex max-w-full items-center rounded-full border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:px-2 sm:text-[11px]">
                          {p.status}
                        </span>
                      </td>
                      <td className="min-w-[8rem] px-2 py-2 text-[11px] sm:px-3 sm:text-xs md:text-sm">
                        {p.lines.map((l, i) => (
                          <div key={i}>
                            {l.child.firstName} — {l.course.name} ({l.tier})
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {isAdmin && (
            <section id="programs" className="scroll-mt-24 sm:scroll-mt-28">
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="space-y-1.5 p-4 sm:p-6">
                <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Programs catalog</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Create and edit programs (subjects). Use a URL-safe slug in lowercase with hyphens (e.g.{" "}
                  <span className="font-mono text-xs">african-culture</span>). New programs appear in checkout and
                  assignment dropdowns. Align slugs with the public site when possible: {PROGRAM_CATEGORIES_SUMMARY}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-4 pt-0 sm:p-6 sm:pt-0">
                <form
                  onSubmit={submitNewCourse}
                  className="grid max-w-full gap-3 rounded-xl border border-border/80 p-3 sm:max-w-xl sm:p-4"
                >
                  <p className="text-sm font-semibold text-foreground">Add program</p>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={newCourseSlug}
                      onChange={(e) => setNewCourseSlug(e.target.value)}
                      placeholder="e.g. coding"
                      className="font-mono text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label>Display name</Label>
                    <Input
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Shown to parents"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={newCourseDescription}
                      onChange={(e) => setNewCourseDescription(e.target.value)}
                      rows={3}
                      className="resize-y"
                    />
                  </div>
                  <Button type="submit" variant="secondary">
                    Create program
                  </Button>
                </form>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Existing programs</p>
                  {courseCatalog.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No programs in the database yet.</p>
                  ) : (
                    <ul className="space-y-3 list-none p-0 m-0">
                      {courseCatalog.map((c) => (
                        <li key={c.id} className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
                          {editingCourseId === c.id ? (
                            <form onSubmit={submitEditCourse} className="grid max-w-full gap-3 sm:max-w-xl">
                              <div>
                                <Label>Slug</Label>
                                <Input
                                  value={editSlug}
                                  onChange={(e) => setEditSlug(e.target.value)}
                                  className="font-mono text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <Label>Display name</Label>
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  rows={3}
                                  className="resize-y"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button type="submit" size="sm">
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingCourseId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-foreground">{c.name}</p>
                                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{c.slug}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button type="button" variant="outline" size="sm" onClick={() => beginEditCourse(c)}>
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteCourse(c.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              {c.description ? (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.description}</p>
                              ) : null}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
            </section>
          )}

          {isAdmin && (
            <section id="staff" className="scroll-mt-24 sm:scroll-mt-28">
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="space-y-1.5 p-4 sm:p-6">
                <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Staff accounts</CardTitle>
                <CardDescription>
                  Create manager or instructor logins. Managers help run the dashboard; instructors see only students
                  assigned to them and class links.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
                <form onSubmit={submitStaff} className="grid max-w-full gap-3 sm:max-w-xl">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Label>First name</Label>
                      <Input
                        value={staffForm.firstName}
                        onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last name</Label>
                      <Input
                        value={staffForm.lastName}
                        onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Temporary password</Label>
                    <Input
                      type="password"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={staffForm.role}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, role: e.target.value as "MANAGER" | "INSTRUCTOR" })
                      }
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="INSTRUCTOR">Instructor</option>
                    </select>
                  </div>
                  <Button type="submit" variant="hero">
                    Create staff account
                  </Button>
                </form>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Existing staff</p>
                  <ul className="space-y-2 text-sm">
                    {staffUsers.map((u) => (
                      <li key={u.id} className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
                        <span className="min-w-0 break-words font-medium">
                          {u.staffProfile ? `${u.staffProfile.firstName} ${u.staffProfile.lastName}` : u.email}
                        </span>
                        <span className="min-w-0 break-all text-muted-foreground text-xs sm:text-sm">{u.email}</span>
                        <span className="text-xs rounded-full bg-muted px-2 py-0.5">{u.role}</span>
                      </li>
                    ))}
                  </ul>
                  {staffUsers.length === 0 && <p className="text-sm text-muted-foreground">No manager or instructor accounts yet.</p>}
                </div>
              </CardContent>
            </Card>
            </section>
          )}

          {isAdmin && (
            <section id="pricing" className="scroll-mt-24 sm:scroll-mt-28">
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="space-y-1.5 p-4 sm:p-6">
                <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">Tier pricing by country</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Amounts apply per program for that age tier. Parents see totals based on how many programs they select.
                  Changes apply to new checkouts immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="-mx-1 w-full min-w-0 overflow-x-auto overscroll-x-contain sm:mx-0">
                <table className="w-full min-w-[560px] text-sm border border-border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Country
                      </th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Tier
                      </th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Amount
                      </th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Currency
                      </th>
                      <th className="px-3 py-2 w-28" />
                    </tr>
                  </thead>
                  <tbody>
                    {tierPrices.map((r) => (
                      <tr key={r.id} className="border-t border-border/80 bg-background/60">
                        <td className="px-3 py-2 capitalize text-sm font-medium">{r.country.replace(/-/g, " ")}</td>
                        <td className="px-3 py-2 text-xs sm:text-sm">{r.tier}</td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-8 max-w-[140px] text-sm"
                            type="number"
                            min={0}
                            step={r.currency === "NGN" ? 1 : 0.01}
                            value={tierDraft[r.id] ?? ""}
                            onChange={(e) => setTierDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs sm:text-sm text-muted-foreground">{r.currency}</td>
                        <td className="px-3 py-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              const amt = Number(tierDraft[r.id]);
                              if (Number.isNaN(amt) || amt <= 0) {
                                toast.error("Enter a valid amount");
                                return;
                              }
                              try {
                                await api.put("/api/admin/tier-prices", {
                                  country: r.country,
                                  tier: r.tier,
                                  amount: amt,
                                  currency: r.currency,
                                });
                                toast.success("Price saved");
                                await load();
                              } catch (err: unknown) {
                                toast.error(err instanceof Error ? err.message : "Save failed");
                              }
                            }}
                          >
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {tierPrices.length === 0 && <p className="text-sm text-muted-foreground py-4">No tier prices in database.</p>}
              </CardContent>
            </Card>
            </section>
          )}

            </div>
          </div>

          <Dialog
            open={selectedParent !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedParent(null);
            }}
          >
            <DialogContent className="flex max-h-[min(92dvh,900px)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden gap-0 p-0 sm:max-h-[min(90vh,900px)] sm:w-full sm:max-w-3xl sm:rounded-xl">
              {selectedParent && (
                <>
                  <DialogHeader className="shrink-0 space-y-2 border-b border-border/80 p-4 pb-3 text-left sm:p-6 sm:pb-4">
                    <div className="flex flex-wrap items-center gap-2 pr-8">
                      <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                        {selectedParent.firstName} {selectedParent.lastName}
                      </DialogTitle>
                      <span
                        className={
                          selectedParent.paidCurrentMonth
                            ? "text-[10px] font-bold uppercase tracking-wide rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 border border-emerald-500/30"
                            : "text-[10px] font-bold uppercase tracking-wide rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200 px-2 py-0.5 border border-amber-500/30"
                        }
                      >
                        {selectedParent.paidCurrentMonth ? "Paid this month" : "Not paid this month"}
                      </span>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Full family overview — subscriptions and timetables per child ({billingMonthLabel}, UTC).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 pt-3 sm:p-6 sm:pt-4">
                    <ParentFamilyDetail p={selectedParent} />
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
        <Footer />
      </div>
    </>
  );
}
