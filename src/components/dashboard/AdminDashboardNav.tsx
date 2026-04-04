import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string; shortLabel: string };

const BASE_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Overview" },
  { id: "parents", label: "Parents & families", shortLabel: "Parents" },
  { id: "assignments", label: "Assignments", shortLabel: "Assign" },
  { id: "timetable", label: "Timetable", shortLabel: "Schedule" },
  { id: "payments", label: "Payments", shortLabel: "Pay" },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: "programs", label: "Programs", shortLabel: "Programs" },
  { id: "staff", label: "Staff", shortLabel: "Staff" },
  { id: "pricing", label: "Pricing", shortLabel: "Prices" },
];

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

const chipClass =
  "inline-flex min-h-[2.25rem] min-w-0 max-w-full shrink-0 items-center justify-center rounded-full border border-border bg-background px-2.5 py-1 text-center text-[11px] font-semibold leading-tight text-foreground shadow-sm transition-colors active:scale-[0.98] active:bg-muted hover:bg-muted hover:border-primary/30 sm:px-3 sm:text-xs";

export function AdminDashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const items = [...BASE_ITEMS, ...(isAdmin ? ADMIN_ITEMS : [])];

  return (
    <>
      <div className="lg:hidden sticky top-16 z-30 -mx-3 mb-2 border-b border-border/60 bg-background/90 px-3 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:top-20 sm:-mx-4 sm:px-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Jump to</p>
        <nav
          className="flex flex-wrap gap-1.5 sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:pb-1"
          aria-label="Dashboard sections"
        >
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={chipClass}>
              <span className="sm:hidden">{item.shortLabel}</span>
              <span className="hidden sm:inline sm:whitespace-nowrap">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      <nav
        className={cn(
          "hidden lg:flex flex-col gap-0.5 w-56 shrink-0 rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm p-3 shadow-sm",
          "sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto"
        )}
        aria-label="Dashboard sections"
      >
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={linkClass}>
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
