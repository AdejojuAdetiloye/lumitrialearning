import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { intervalToDuration } from "date-fns";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, CalendarClock, Timer } from "lucide-react";
import { formatSlotForFamily, sortTimetableByWeekdayInFamilyZone } from "@/lib/familyTimezone";
import { InstructorAssignmentsBlock } from "@/components/dashboard/InstructorAssignmentsBlock";
import { type InstructorAssignmentDisplay } from "@/lib/instructorDisplay";

type Tier = "ROOKIES" | "EXPLORERS" | "ASCENT" | "VETERAN";

type ChildDetail = {
  id: string;
  firstName: string;
  lastName: string;
  familyCountry?: string;
  birthDate: string | null;
  instructorAssignments?: (InstructorAssignmentDisplay & { id: string })[];
  nextPaymentAt: string | null;
  msToNextPayment: number;
  subscriptions: {
    id: string;
    course: { id: string; slug: string; name: string };
    tier: Tier;
    currentPeriodEnd: string;
    amount: string;
    currency: string;
    msRemaining: number;
  }[];
  timetable: { id: string; title: string; startsAt: string; endsAt: string; meetingLink: string }[];
};

const TIER_LABEL: Record<Tier, string> = {
  ROOKIES: "Rookies (5–7)",
  EXPLORERS: "Explorers (8–10)",
  ASCENT: "Ascent (10–13)",
  VETERAN: "Veteran (14–17)",
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Payment due — renew to keep uninterrupted access";
  const d = intervalToDuration({ start: 0, end: ms });
  const parts: string[] = [];
  if (d.days) parts.push(`${d.days}d`);
  if (d.hours) parts.push(`${d.hours}h`);
  if (d.minutes) parts.push(`${d.minutes}m`);
  parts.push(`${d.seconds ?? 0}s`);
  return parts.join(" ");
}

function formatMoney(currency: string, amount: string | number): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  const digits = currency === "NGN" ? 0 : 2;
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

const ChildTimetablePage = () => {
  const { childId } = useParams();
  const [detail, setDetail] = useState<ChildDetail | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!childId) return;
    api
      .get<ChildDetail>(`/api/parent/child/${childId}`)
      .then(setDetail)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));
  }, [childId]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const msToNext = useMemo(() => {
    if (!detail?.nextPaymentAt) return 0;
    return Math.max(0, new Date(detail.nextPaymentAt).getTime() - Date.now());
  }, [detail?.nextPaymentAt, tick]);

  const sortedTimetable = useMemo(
    () =>
      sortTimetableByWeekdayInFamilyZone(detail?.timetable ?? [], detail?.familyCountry ?? "nigeria"),
    [detail?.timetable, detail?.familyCountry]
  );

  return (
    <>
      <Helmet>
        <title>{detail ? `${detail.firstName} ${detail.lastName}` : "Child"} | Lumitria</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 pt-24 max-w-3xl space-y-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link to="/dashboard/parent">← Back to dashboard</Link>
          </Button>
          {detail && (
            <>
              <div>
                <h1 className="text-2xl font-bold">
                  {detail.firstName} {detail.lastName}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Subjects, schedule, and billing</p>
                <InstructorAssignmentsBlock assignments={detail.instructorAssignments} className="mt-3" />
              </div>

              <Card variant="elevated" className="border-primary/20">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <Timer className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">Next payment</CardTitle>
                    <CardDescription>Countdown to the earliest renewal among active subjects</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {detail.subscriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active subscription yet.</p>
                  ) : detail.nextPaymentAt ? (
                    <div className="space-y-2">
                      <p className="text-3xl font-bold tabular-nums text-foreground">{formatCountdown(msToNext)}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(detail.nextPaymentAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Renewal date will appear after payment.</p>
                  )}
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">Subjects</CardTitle>
                    <CardDescription>Courses this child is enrolled in</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {detail.subscriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects yet — complete enrollment from the dashboard.</p>
                  ) : (
                    <ul className="space-y-3">
                      {detail.subscriptions.map((s) => (
                        <li key={s.id} className="rounded-lg border border-border p-3 text-sm">
                          <p className="font-semibold text-foreground">{s.course.name}</p>
                          <p className="text-muted-foreground">Age group: {TIER_LABEL[s.tier] ?? s.tier}</p>
                          <p className="text-muted-foreground mt-1">
                            Per period: {formatMoney(s.currency, s.amount)} · Renews{" "}
                            {new Date(s.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <CalendarClock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">Class timetable</CardTitle>
                    <CardDescription>
                      Each class shows the day of the week and the time in your region (WAT, EST, UK time, etc.).
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {sortedTimetable.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No classes scheduled yet.</p>
                  ) : (
                    <ul className="space-y-5">
                      {sortedTimetable.map((e) => {
                        const slot = formatSlotForFamily(e.startsAt, e.endsAt, detail.familyCountry ?? "nigeria");
                        return (
                        <li key={e.id} className="rounded-xl border border-border/80 bg-muted/20 px-4 py-4 last:border-b-0">
                          <p className="font-semibold text-base text-foreground">{e.title}</p>
                          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">{slot.headlineDay}</p>
                          <p className="text-xl font-semibold tabular-nums text-primary">{slot.timeRange}</p>
                          <a
                            href={e.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm font-medium inline-block mt-2 hover:underline"
                          >
                            Open class link
                          </a>
                        </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ChildTimetablePage;
