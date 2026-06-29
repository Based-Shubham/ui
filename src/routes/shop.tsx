import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, X, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "QuickPrint — Shop staff queue" },
      {
        name: "description",
        content: "Shop-side queue view: incoming jobs, file details, accept or reject.",
      },
    ],
  }),
  component: ShopQueue,
});

type Job = {
  token: string;
  customer: string;
  files: { name: string; pages: number; copies: number; paper: string; color: "B/W" | "Color" }[];
  cost: number;
  letShopDecide: boolean;
  status: "queued" | "printing" | "done" | "rejected";
};

const SEED: Job[] = [
  {
    token: "284",
    customer: "Counter walk-in",
    files: [
      { name: "Application_Form_Final.pdf", pages: 4, copies: 2, paper: "A4", color: "B/W" },
      { name: "Passport_Photo.jpg", pages: 1, copies: 4, paper: "A4", color: "Color" },
    ],
    cost: 56,
    letShopDecide: false,
    status: "queued",
  },
  {
    token: "285",
    customer: "Vendor review",
    files: [{ name: "Wedding_Card_Draft.pdf", pages: 2, copies: 50, paper: "A4", color: "Color" }],
    cost: 1000,
    letShopDecide: true,
    status: "queued",
  },
  {
    token: "286",
    customer: "Counter walk-in",
    files: [{ name: "ID_Copy.pdf", pages: 1, copies: 1, paper: "A4", color: "B/W" }],
    cost: 2,
    letShopDecide: false,
    status: "printing",
  },
];

function ShopQueue() {
  const [jobs, setJobs] = useState<Job[]>(SEED);

  const setStatus = (token: string, status: Job["status"]) =>
    setJobs((p) => p.map((j) => (j.token === token ? { ...j, status } : j)));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            to="/"
            className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to customer app
          </Link>
          <div className="flex items-center gap-2">
            <Printer className="size-4 text-primary" />
            <span className="text-sm font-semibold">Shop queue</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold">Incoming jobs</h1>
          <span className="text-xs text-muted-foreground">
            {jobs.filter((j) => j.status === "queued").length} queued ·{" "}
            {jobs.filter((j) => j.status === "printing").length} printing
          </span>
        </div>

        {jobs.map((j) => (
          <div
            key={j.token}
            className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground">
                  #{j.token}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {j.customer}
                    {j.letShopDecide && (
                      <span className="ml-2 rounded-full bg-earth/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-earth">
                        Shop decides
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {j.files.length} files · ₹{j.cost.toFixed(2)} estimate
                  </p>
                </div>
              </div>
              <StatusPill status={j.status} />
            </div>

            <ul className="divide-y divide-border">
              {j.files.map((f) => (
                <li
                  key={f.name}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {f.pages} pgs × {f.copies} · {f.paper} · {f.color}
                  </span>
                </li>
              ))}
            </ul>

            {j.status === "queued" && (
              <div className="flex gap-3 border-t border-border px-5 py-4">
                <button
                  onClick={() => setStatus(j.token, "rejected")}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-border hover:text-destructive"
                >
                  <X className="size-4" /> Reject
                </button>
                <button
                  onClick={() => setStatus(j.token, "printing")}
                  className="inline-flex min-h-10 flex-[2] items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20"
                >
                  <Printer className="size-4" /> Print now
                </button>
              </div>
            )}
            {j.status === "printing" && (
              <div className="border-t border-border px-5 py-4">
                <button
                  onClick={() => setStatus(j.token, "done")}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-success/40"
                >
                  <Check className="size-4" /> Mark ready for pickup
                </button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: Job["status"] }) {
  const map = {
    queued: { l: "Queued", c: "bg-accent/30 text-foreground" },
    printing: { l: "Printing", c: "bg-warning/25 text-foreground" },
    done: { l: "Ready", c: "bg-success/20 text-foreground" },
    rejected: { l: "Rejected", c: "bg-destructive/15 text-destructive" },
  } as const;
  const s = map[status];
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${s.c}`}>
      {s.l}
    </span>
  );
}
