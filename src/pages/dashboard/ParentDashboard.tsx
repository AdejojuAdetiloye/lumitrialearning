import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { InstructorAssignmentsBlock } from "@/components/dashboard/InstructorAssignmentsBlock";
import { type InstructorAssignmentDisplay } from "@/lib/instructorDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChevronRight, Loader2 } from "lucide-react";

type Tier = "ROOKIES" | "EXPLORERS" | "ASCENT" | "VETERAN";

type Course = { id: string; slug: string; name: string };

type DashboardSub = {
  id: string;
  course: Course;
  tier: Tier;
  currentPeriodEnd: string;
  msRemaining: number;
};

type DashboardChild = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  needsEnrollmentPayment: boolean;
  pendingEnrollmentPayment: { id: string; totalAmount: string; currency: string } | null;
  instructorAssignments?: (InstructorAssignmentDisplay & { id: string })[];
  subscriptions: DashboardSub[];
};

type QuoteResponse = {
  currency: string;
  unitPrice: number;
  total: number;
  tier: Tier;
  lines: { courseSlug: string; courseName: string; amount: number }[];
};

const TIERS: { value: Tier; label: string }[] = [
  { value: "ROOKIES", label: "Rookies (5–7)" },
  { value: "EXPLORERS", label: "Explorers (8–10)" },
  { value: "ASCENT", label: "Ascent (10–13)" },
  { value: "VETERAN", label: "Veteran (14–17)" },
];

const SALUTATION_DISPLAY: Record<string, string> = {
  MR: "Mr",
  MRS: "Mrs",
  MS: "Ms",
  MX: "Mx",
};

function isoToDateInput(iso: string | null): string {
  if (!iso || iso.length < 10) return "";
  return iso.slice(0, 10);
}

function formatMoney(currency: string, amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  });
}

const ParentDashboard = () => {
  const { user, refresh } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState<{ children: DashboardChild[] } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const [newChild, setNewChild] = useState({ firstName: "", lastName: "", birthDate: "" });

  const [enrollFirst, setEnrollFirst] = useState("");
  const [enrollLast, setEnrollLast] = useState("");
  const [enrollBirth, setEnrollBirth] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<Record<string, boolean>>({});
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [resumeLoadingId, setResumeLoadingId] = useState<string | null>(null);

  const [payDialogChild, setPayDialogChild] = useState<DashboardChild | null>(null);
  const [dialogSlugs, setDialogSlugs] = useState<Record<string, boolean>>({});
  const [dialogBirth, setDialogBirth] = useState("");
  const [dialogQuote, setDialogQuote] = useState<QuoteResponse | null>(null);
  const [dialogQuoteLoading, setDialogQuoteLoading] = useState(false);
  const [dialogQuoteError, setDialogQuoteError] = useState<string | null>(null);
  const [dialogCheckoutLoading, setDialogCheckoutLoading] = useState(false);

  const selectedCourseList = useMemo(
    () => courses.filter((c) => selectedSlugs[c.slug]).map((c) => c.slug),
    [courses, selectedSlugs]
  );

  const dialogSelectedCourseList = useMemo(
    () => courses.filter((c) => dialogSlugs[c.slug]).map((c) => c.slug),
    [courses, dialogSlugs]
  );

  const load = useCallback(async () => {
    const [dash, co] = await Promise.all([
      api.get<{ children: DashboardChild[] }>("/api/parent/dashboard"),
      api.get<Course[]>("/api/pricing/courses"),
    ]);
    setDashboard(dash);
    setCourses(co);
  }, []);

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));
  }, [load]);

  const checkoutReturnQuery = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(checkoutReturnQuery);
    const status = params.get("status");
    const txRef = params.get("tx_ref");
    const transactionId = params.get("transaction_id");
    if (status !== "successful" || (!txRef && !transactionId)) return;

    let cancelled = false;
    void (async () => {
      try {
        await api.post("/api/checkout/flutterwave-verify", {
          tx_ref: txRef || undefined,
          transaction_id: transactionId || undefined,
        });
        if (cancelled) return;
        toast.success("Payment successful!");
        setEnrollFirst("");
        setEnrollLast("");
        setEnrollBirth("");
        setSelectedSlugs({});
        setQuote(null);
        setPayDialogChild(null);
        await load();
        await refresh();
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Could not confirm payment");
      } finally {
        if (!cancelled) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete("status");
              next.delete("tx_ref");
              next.delete("transaction_id");
              return next;
            },
            { replace: true },
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkoutReturnQuery, setSearchParams, load, refresh]);

  useEffect(() => {
    if (selectedCourseList.length === 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    if (!enrollBirth) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    const birthIso = new Date(`${enrollBirth}T12:00:00`).toISOString();
    const ac = new AbortController();
    setQuoteLoading(true);
    setQuoteError(null);
    api
      .post<QuoteResponse>("/api/parent/enrollment-quote", {
        birthDate: birthIso,
        courseSlugs: selectedCourseList,
      })
      .then((q) => {
        if (!ac.signal.aborted) {
          setQuote(q);
          setQuoteError(null);
        }
      })
      .catch((e) => {
        if (!ac.signal.aborted) {
          setQuote(null);
          setQuoteError(e instanceof Error ? e.message : "Could not calculate price");
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setQuoteLoading(false);
      });
    return () => ac.abort();
  }, [enrollBirth, selectedCourseList.join(",")]);

  useEffect(() => {
    if (!payDialogChild) return;
    if (dialogSelectedCourseList.length === 0) {
      setDialogQuote(null);
      setDialogQuoteError(null);
      return;
    }
    if (!dialogBirth) {
      setDialogQuote(null);
      setDialogQuoteError(null);
      return;
    }
    const birthIso = new Date(`${dialogBirth}T12:00:00`).toISOString();
    const ac = new AbortController();
    setDialogQuoteLoading(true);
    setDialogQuoteError(null);
    api
      .post<QuoteResponse>("/api/parent/enrollment-quote", {
        birthDate: birthIso,
        courseSlugs: dialogSelectedCourseList,
      })
      .then((q) => {
        if (!ac.signal.aborted) {
          setDialogQuote(q);
          setDialogQuoteError(null);
        }
      })
      .catch((e) => {
        if (!ac.signal.aborted) {
          setDialogQuote(null);
          setDialogQuoteError(e instanceof Error ? e.message : "Could not calculate price");
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setDialogQuoteLoading(false);
      });
    return () => ac.abort();
  }, [payDialogChild?.id, dialogBirth, dialogSelectedCourseList.join(","), payDialogChild]);

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/parent/children", {
      firstName: newChild.firstName,
      lastName: newChild.lastName,
      ...(newChild.birthDate
        ? { birthDate: new Date(newChild.birthDate + "T12:00:00").toISOString() }
        : {}),
    });
    toast.success("Child added");
    setNewChild({ firstName: "", lastName: "", birthDate: "" });
    await load();
    await refresh();
  };

  const toggleCourse = (slug: string, checked: boolean) => {
    setSelectedSlugs((prev) => ({ ...prev, [slug]: checked }));
  };

  const toggleDialogCourse = (slug: string, checked: boolean) => {
    setDialogSlugs((prev) => ({ ...prev, [slug]: checked }));
  };

  const openPayDialogForChild = (c: DashboardChild) => {
    setPayDialogChild(c);
    setDialogSlugs({});
    setDialogBirth(isoToDateInput(c.birthDate));
    setDialogQuote(null);
    setDialogQuoteError(null);
  };

  const dialogCanPay = Boolean(
    payDialogChild &&
      dialogBirth &&
      dialogSelectedCourseList.length > 0 &&
      dialogQuote &&
      !dialogQuoteLoading &&
      !dialogQuoteError,
  );

  const startDialogCheckout = async () => {
    if (!payDialogChild || !dialogQuote || !dialogBirth) return;
    setDialogCheckoutLoading(true);
    try {
      const birthIso = new Date(`${dialogBirth}T12:00:00`).toISOString();
      if (!payDialogChild.birthDate || isoToDateInput(payDialogChild.birthDate) !== dialogBirth) {
        await api.patch(`/api/parent/children/${payDialogChild.id}`, { birthDate: birthIso });
      }
      const redirectUrl = `${window.location.origin}/dashboard/parent`;
      const items = dialogSelectedCourseList.map((slug) => ({
        childId: payDialogChild.id,
        courseSlug: slug,
        tier: dialogQuote.tier,
      }));
      const res = await api.post<{ checkoutLink: string }>("/api/checkout/create-order", {
        items,
        redirectUrl,
      });
      window.location.href = res.checkoutLink;
    } catch (e) {
      setDialogCheckoutLoading(false);
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    }
  };

  const canPay =
    enrollFirst.trim() &&
    enrollLast.trim() &&
    enrollBirth &&
    selectedCourseList.length > 0 &&
    quote &&
    !quoteLoading &&
    !quoteError;

  const startFlutterwaveCheckout = async () => {
    const redirectUrl = `${window.location.origin}/dashboard/parent`;
    setCheckoutLoading(true);
    try {
      const enrollment = {
        firstName: enrollFirst.trim(),
        lastName: enrollLast.trim(),
        birthDate: new Date(`${enrollBirth}T12:00:00`).toISOString(),
        courseSlugs: selectedCourseList,
      };
      const res = await api.post<{ checkoutLink: string }>("/api/checkout/create-order", {
        enrollment,
        redirectUrl,
      });
      window.location.href = res.checkoutLink;
    } catch (e) {
      setCheckoutLoading(false);
      toast.error(e instanceof Error ? e.message : "Could not start checkout");
    }
  };

  const resumePendingCheckout = async (paymentId: string) => {
    const redirectUrl = `${window.location.origin}/dashboard/parent`;
    setResumeLoadingId(paymentId);
    try {
      const res = await api.post<{ checkoutLink: string }>("/api/checkout/resume-payment", {
        paymentId,
        redirectUrl,
      });
      window.location.href = res.checkoutLink;
    } catch (e) {
      setResumeLoadingId(null);
      toast.error(e instanceof Error ? e.message : "Could not resume checkout");
    }
  };

  const welcomeHeading = useMemo(() => {
    const p = user?.profile;
    if (!p?.firstName?.trim()) return "Welcome back";
    const title = (p.salutation && SALUTATION_DISPLAY[p.salutation]) || "Mr";
    const name = `${p.firstName} ${p.lastName}`.trim();
    return `Welcome back, ${title} ${name}`;
  }, [user?.profile]);

  return (
    <>
      <Helmet>
        <title>Parent dashboard | Lumitria</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 pt-24 max-w-6xl space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{welcomeHeading}</h1>
              <p className="text-muted-foreground mt-1">
                Your home base — enroll in subjects, pay securely, and open each child&apos;s weekly schedule.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/">Back to site</Link>
            </Button>
          </div>

          <section className="grid md:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-xl font-semibold tracking-tight">Add a child (optional)</CardTitle>
                <CardDescription>
                  Save a child profile without paying yet. Birth date is optional here; payment checkout always requires
                  it so we can set the correct age group.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addChild} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>First name</Label>
                      <Input
                        value={newChild.firstName}
                        onChange={(e) => setNewChild({ ...newChild, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last name</Label>
                      <Input
                        value={newChild.lastName}
                        onChange={(e) => setNewChild({ ...newChild, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Birth date (optional)</Label>
                    <Input
                      type="date"
                      value={newChild.birthDate}
                      onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full">
                    Save child
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-xl font-semibold tracking-tight">Pay for classes</CardTitle>
                <CardDescription>
                  Use this if you&apos;re adding a brand-new child and paying in one step. If the child is already listed
                  below, it&apos;s easier to tap <span className="font-medium text-foreground">Pay now</span> on their card.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Child first name</Label>
                    <Input value={enrollFirst} onChange={(e) => setEnrollFirst(e.target.value)} placeholder="Ada" />
                  </div>
                  <div>
                    <Label>Child last name</Label>
                    <Input value={enrollLast} onChange={(e) => setEnrollLast(e.target.value)} placeholder="Okafor" />
                  </div>
                </div>
                <div>
                  <Label>Child birth date</Label>
                  <Input type="date" value={enrollBirth} onChange={(e) => setEnrollBirth(e.target.value)} required />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required. We use this to assign the correct age group and pricing — parents cannot edit the group.
                  </p>
                </div>
                {quote && !quoteLoading && (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age group (automatic)</p>
                    <p className="text-base font-semibold text-foreground">
                      {TIERS.find((t) => t.value === quote.tier)?.label ?? quote.tier}
                    </p>
                    <p className="text-xs text-muted-foreground">Based on birth date and today&apos;s date. Not editable.</p>
                  </div>
                )}
                <div>
                  <Label>Subjects</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select one or more — total updates automatically.</p>
                  <div className="rounded-xl border border-border divide-y divide-border bg-muted/20">
                    {courses.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={!!selectedSlugs[c.slug]}
                          onCheckedChange={(v) => toggleCourse(c.slug, v === true)}
                        />
                        <span className="text-sm font-medium">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
                  {quoteLoading && <p className="text-sm text-muted-foreground">Calculating…</p>}
                  {!quoteLoading && !quote && selectedCourseList.length === 0 && (
                    <p className="text-sm text-muted-foreground">Select at least one subject to see pricing.</p>
                  )}
                  {!quoteLoading && !quote && selectedCourseList.length > 0 && !enrollBirth && (
                    <p className="text-sm text-muted-foreground">Enter the child&apos;s birth date to see pricing and pay.</p>
                  )}
                  {quoteError && (
                    <p className="text-sm text-destructive">{quoteError}</p>
                  )}
                  {quote && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {quote.lines.length} × {quote.currency} {quote.unitPrice.toFixed(quote.currency === "NGN" ? 0 : 2)}{" "}
                        per subject ({TIERS.find((t) => t.value === quote.tier)?.label ?? quote.tier})
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        Total: {quote.currency}{" "}
                        {quote.total.toLocaleString(undefined, {
                          minimumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                          maximumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                        })}
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc pl-4 pt-1">
                        {quote.lines.map((l) => (
                          <li key={l.courseSlug}>
                            {l.courseName} — {quote.currency}{" "}
                            {l.amount.toLocaleString(undefined, {
                              minimumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                              maximumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                            })}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {canPay && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="hero"
                      className="w-full sm:w-auto"
                      disabled={checkoutLoading}
                      onClick={() => void startFlutterwaveCheckout()}
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Redirecting to checkout…
                        </>
                      ) : (
                        `Pay ${quote.currency} ${quote.total.toLocaleString(undefined, {
                          minimumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                          maximumFractionDigits: quote.currency === "NGN" ? 0 : 2,
                        })} with Flutterwave`
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 max-w-md">
                      You&apos;ll complete payment on Flutterwave in your plan&apos;s currency ({quote.currency}). Card,
                      bank, and local methods depend on your region.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-2 text-foreground">Your children</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tap a card to open schedules and details. If enrollment isn&apos;t paid yet, use{" "}
              <span className="font-medium text-foreground">Pay now</span> — prices use your account region automatically.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard?.children.map((c) => (
                <Card
                  key={c.id}
                  variant="pricing"
                  className="relative flex h-full flex-col overflow-hidden transition-smooth hover:border-primary/50 hover:shadow-md"
                >
                  <Link to={`/dashboard/parent/child/${c.id}`} className="block flex-1 min-h-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">
                        {c.firstName} {c.lastName}
                      </CardTitle>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent className="space-y-2 pb-4">
                      <InstructorAssignmentsBlock
                        assignments={c.instructorAssignments}
                        compact
                        heading="Programs"
                        className="text-sm"
                      />
                      {c.subscriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No active enrollment yet.</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {c.subscriptions.length} active subject{c.subscriptions.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </CardContent>
                  </Link>
                  {c.needsEnrollmentPayment && (
                    <div className="border-t border-border/80 bg-muted/20 px-4 py-3 space-y-1.5">
                      {c.pendingEnrollmentPayment ? (
                        <Button
                          type="button"
                          variant="hero"
                          className="w-full"
                          disabled={resumeLoadingId !== null}
                          onClick={(e) => {
                            e.preventDefault();
                            void resumePendingCheckout(c.pendingEnrollmentPayment!.id);
                          }}
                        >
                          {resumeLoadingId === c.pendingEnrollmentPayment.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              Opening checkout…
                            </>
                          ) : (
                            <>
                              Pay now — {c.pendingEnrollmentPayment.currency}{" "}
                              {formatMoney(c.pendingEnrollmentPayment.currency, Number(c.pendingEnrollmentPayment.totalAmount))}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="hero"
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            openPayDialogForChild(c);
                          }}
                        >
                          Pay now
                        </Button>
                      )}
                      <p className="text-[11px] text-center text-muted-foreground leading-snug">
                        Charged in your region&apos;s currency when you pay on Flutterwave.
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {dashboard?.children.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add a child above or complete the enrollment form — then you&apos;ll see them here with{" "}
                <span className="font-medium text-foreground">Pay now</span> until payment is done.
              </p>
            )}
          </section>
        </main>

        <Dialog
          open={payDialogChild !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPayDialogChild(null);
              setDialogSlugs({});
              setDialogBirth("");
              setDialogQuote(null);
              setDialogQuoteError(null);
            }
          }}
        >
          <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-lg">
            {payDialogChild && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    Pay for {payDialogChild.firstName} {payDialogChild.lastName}
                  </DialogTitle>
                  <DialogDescription>
                    Choose subjects. The total uses your location pricing (same as the rest of the site). You can finish
                    payment whenever you&apos;re ready.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Child birth date</Label>
                    <Input
                      type="date"
                      className="mt-1.5"
                      value={dialogBirth}
                      onChange={(e) => setDialogBirth(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for age group and pricing. We save it on your child&apos;s profile when you pay.
                    </p>
                  </div>
                  <div>
                    <Label>Subjects</Label>
                    <div className="mt-2 rounded-xl border border-border divide-y divide-border bg-muted/20 max-h-48 overflow-y-auto">
                      {courses.map((course) => (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={!!dialogSlugs[course.slug]}
                            onCheckedChange={(v) => toggleDialogCourse(course.slug, v === true)}
                          />
                          <span className="text-sm font-medium">{course.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
                    {dialogQuoteLoading && <p className="text-sm text-muted-foreground">Calculating your price…</p>}
                    {!dialogQuoteLoading && dialogQuoteError && (
                      <p className="text-sm text-destructive">{dialogQuoteError}</p>
                    )}
                    {!dialogQuoteLoading && !dialogQuote && dialogSelectedCourseList.length === 0 && (
                      <p className="text-sm text-muted-foreground">Select at least one subject.</p>
                    )}
                    {!dialogQuoteLoading && !dialogQuote && dialogSelectedCourseList.length > 0 && !dialogBirth && (
                      <p className="text-sm text-muted-foreground">Enter birth date to see the total.</p>
                    )}
                    {dialogQuote && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {TIERS.find((t) => t.value === dialogQuote.tier)?.label ?? dialogQuote.tier} —{" "}
                          {dialogQuote.lines.length} subject{dialogQuote.lines.length === 1 ? "" : "s"} ×{" "}
                          {dialogQuote.currency}{" "}
                          {dialogQuote.unitPrice.toFixed(dialogQuote.currency === "NGN" ? 0 : 2)}
                        </p>
                        <p className="text-xl font-bold text-foreground">
                          Total {dialogQuote.currency}{" "}
                          {formatMoney(dialogQuote.currency, dialogQuote.total)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    type="button"
                    variant="hero"
                    className="w-full"
                    disabled={!dialogCanPay || dialogCheckoutLoading}
                    onClick={() => void startDialogCheckout()}
                  >
                    {dialogCheckoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Redirecting to secure checkout…
                      </>
                    ) : dialogQuote ? (
                      `Pay ${dialogQuote.currency} ${formatMoney(dialogQuote.currency, dialogQuote.total)}`
                    ) : (
                      "Pay now"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
};

export default ParentDashboard;
