import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  X,
  RotateCcw,
  RotateCw,
  ChevronDown,
  Minus,
  Plus,
  Check,
  Download,
  Send,
  Trash2,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Store,
  Printer,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  T,
  tr,
  LANGS,
  type Lang,
} from "@/lib/i18n";
import {
  ALLOWED_EXT,
  DEFAULT_SETTINGS,
  MAX_BYTES,
  costForFile,
  estimatePages,
  extOf,
  formatBytes,
  isImage,
  isPdf,
  type ColorMode,
  type Orientation,
  type PaperSize,
  type PrintFile,
  type Sides,
} from "@/lib/print";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickPrint — Scan. Upload. Print." },
      {
        name: "description",
        content:
          "Send documents to your neighborhood print shop from your phone. Live cost, per-file settings, in English, हिंदी, and मराठी.",
      },
      { property: "og:title", content: "QuickPrint — Scan. Upload. Print." },
      {
        property: "og:description",
        content:
          "Wireless printing for everyone. No app to install, no account to make.",
      },
    ],
  }),
  component: QuickPrintPage,
});

type Toast = { id: number; kind: "success" | "warning" | "info"; text: string };

type JobStatus = "queued" | "printing" | "done";
type Job = {
  token: string;
  position: number;
  status: JobStatus;
  letShopDecide: boolean;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function QuickPrintPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shopModal, setShopModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);
  const [viewConsent, setViewConsent] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [downloadConsent, setDownloadConsent] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const jobRef = useRef<HTMLDivElement>(null);

  // Apply dark class on documentElement
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Devanagari for HI/MR using Noto Sans Devanagari (already loaded in root)
  const langClass = lang === "en" ? "" : "[font-family:'Noto_Sans_Devanagari',_Instrument_Sans,_sans-serif]";

  // Job progress simulation
  useEffect(() => {
    if (!job || job.status === "done") return;
    const t1 = setTimeout(() => {
      setJob((j) => (j ? { ...j, status: "printing" } : j));
    }, 4000);
    const t2 = setTimeout(() => {
      setJob((j) => (j ? { ...j, status: "done" } : j));
    }, 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [job?.token]);

  const pushToast = useCallback(
    (kind: Toast["kind"], text: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, text }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2600);
    },
    [],
  );

  const handleFiles = useCallback(
    (raw: FileList | File[]) => {
      const list = Array.from(raw);
      const accepted: PrintFile[] = [];
      let skipped = 0;
      for (const f of list) {
        const ext = extOf(f.name);
        if (!ALLOWED_EXT.includes(ext) || f.size > MAX_BYTES) {
          skipped++;
          continue;
        }
        const previewUrl = isImage(ext) || isPdf(ext) ? URL.createObjectURL(f) : undefined;
        accepted.push({
          id: newId(),
          name: f.name,
          size: f.size,
          type: f.type,
          ext,
          pages: estimatePages(f, ext),
          rotation: 0,
          previewUrl,
          settings: { ...DEFAULT_SETTINGS },
        });
      }
      if (skipped > 0) pushToast("warning", tr(lang, "badFile"));
      if (accepted.length === 0) return;

      // Simulate upload progress
      setUploading(true);
      setUploadPct(0);
      const start = Date.now();
      const dur = 900;
      const tick = () => {
        const p = Math.min(100, ((Date.now() - start) / dur) * 100);
        setUploadPct(p);
        if (p < 100) requestAnimationFrame(tick);
        else {
          setFiles((prev) => [...prev, ...accepted]);
          setExpanded((prev) => {
            const next = new Set(prev);
            if (accepted[0]) next.add(accepted[0].id);
            return next;
          });
          setUploading(false);
          pushToast("success", tr(lang, "uploadDone"));
          setTimeout(() => {
            fileListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        }
      };
      requestAnimationFrame(tick);
    },
    [lang, pushToast],
  );

  const onPick = () => inputRef.current?.click();

  const updateFile = (id: string, patch: Partial<PrintFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };
  const updateSettings = (id: string, patch: Partial<PrintFile["settings"]>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...patch } } : f)),
    );
  };
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };
  const clearAll = () => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setExpanded(new Set());
    pushToast("success", tr(lang, "cleared"));
  };

  const totals = useMemo(() => {
    let cost = 0;
    let pages = 0;
    for (const f of files) {
      const c = costForFile(f);
      cost += c.cost;
      pages += c.pages;
    }
    return { cost, pages };
  }, [files]);

  const submitJob = (letShopDecide: boolean) => {
    if (files.length === 0) {
      pushToast("warning", tr(lang, "noFiles"));
      return;
    }
    const token = String(Math.floor(100 + Math.random() * 900));
    const position = Math.floor(1 + Math.random() * 5);
    setJob({ token, position, status: "queued", letShopDecide });
    pushToast("success", letShopDecide ? tr(lang, "vendorDone") : tr(lang, "quickDone"));
    setTimeout(() => {
      jobRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openCustom = () => {
    if (files.length === 0) {
      pushToast("warning", tr(lang, "noFiles"));
      return;
    }
    setExpanded(new Set([files[0].id]));
    setTimeout(() => {
      const el = document.getElementById(`file-${files[0].id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const openShopModal = () => {
    if (files.length === 0) {
      pushToast("warning", tr(lang, "noFiles"));
      return;
    }
    setViewConsent(false);
    setAllowDownload(false);
    setDownloadConsent(false);
    setShopModal(true);
  };

  const confirmShopDecide = () => {
    if (!viewConsent) return;
    setShopModal(false);
    submitJob(true);
  };

  return (
    <div className={`relative min-h-dvh bg-background text-foreground curved-motif pb-40 ${langClass}`}>
      {/* Decorative corner arcs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-accent/40 opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full border border-earth/20 opacity-50"
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[560px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-label="QuickPrint logo"
              className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-border-strong bg-primary font-semibold tracking-tight text-primary-foreground shadow-sm"
            >
              QP
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-none">
                {tr(lang, "brand")}
              </h1>
              <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                {tr(lang, "tagline")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-full bg-surface-muted p-1 ring-1 ring-border" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  className={`min-h-7 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    lang === l.code
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label={tr(lang, "theme")}
              className="grid size-9 place-items-center rounded-full bg-surface-muted ring-1 ring-border text-foreground transition-colors hover:bg-surface"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Toasts */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto flex max-w-[560px] flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-enter pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${
              t.kind === "success"
                ? "border-success/30 bg-success/10 text-foreground"
                : t.kind === "warning"
                  ? "border-warning/40 bg-warning/15 text-foreground"
                  : "border-border bg-surface text-foreground"
            }`}
          >
            {t.kind === "success" && <CheckCircle2 className="size-4 text-success" />}
            {t.kind === "warning" && <AlertTriangle className="size-4 text-warning" />}
            {t.kind === "info" && <Loader2 className="size-4 animate-spin" />}
            <span className="leading-tight">{t.text}</span>
          </div>
        ))}
      </div>

      <main className="mx-auto max-w-[560px] space-y-8 px-4 py-8">
        {/* Upload Zone */}
        <section aria-labelledby="upload-heading">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ALLOWED_EXT.map((e) => "." + e).join(",")}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            onClick={onPick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
            }}
            className="group relative flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent bg-accent/10 px-6 text-center transition-colors hover:bg-accent/20"
          >
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-accent/30 text-primary">
              <Upload className="size-5" />
            </div>
            <h2 id="upload-heading" className="text-balance text-lg font-semibold">
              {tr(lang, "uploadTitle")}
            </h2>
            <p className="mt-1 max-w-[36ch] text-pretty text-sm text-muted-foreground">
              {tr(lang, "uploadHint")}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick();
              }}
              disabled={uploading}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {tr(lang, "uploading")}
                </>
              ) : files.length === 0 ? (
                tr(lang, "selectFiles")
              ) : (
                tr(lang, "addMore")
              )}
            </button>

            {uploading && (
              <div className="mt-5 w-full max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-100"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.round(uploadPct)}%
                </p>
              </div>
            )}
          </div>
        </section>

        {/* File List */}
        <section ref={fileListRef} aria-labelledby="files-heading" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between px-1">
            <h3 id="files-heading" className="text-sm font-medium text-muted-foreground">
              {files.length} {tr(lang, "filesSelected")}
            </h3>
            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="min-h-9 text-sm font-medium text-earth transition-opacity hover:opacity-80"
              >
                {tr(lang, "clearAll")}
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-10 text-center">
              <FileText className="mx-auto mb-3 size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{tr(lang, "emptyTitle")}</p>
            </div>
          ) : (
            files.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                lang={lang}
                expanded={expanded.has(f.id)}
                onToggle={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    n.has(f.id) ? n.delete(f.id) : n.add(f.id);
                    return n;
                  })
                }
                onUpdate={updateFile}
                onSettings={updateSettings}
                onRemove={removeFile}
              />
            ))
          )}
        </section>

        {/* Secondary Actions */}
        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={openCustom}
            className="min-h-12 rounded-2xl bg-surface px-4 py-3 text-sm font-medium ring-1 ring-border transition-colors hover:bg-surface-muted"
          >
            {tr(lang, "customSettings")}
          </button>
          <button
            onClick={openShopModal}
            className="min-h-12 rounded-2xl bg-surface px-4 py-3 text-sm font-medium ring-1 ring-border transition-colors hover:bg-surface-muted"
          >
            {tr(lang, "letShopDecide")}
          </button>
        </section>

        {/* Job Status */}
        {job && (
          <section
            ref={jobRef}
            aria-live="polite"
            className="scroll-mt-20 rounded-3xl bg-primary p-5 text-primary-foreground shadow-xl shadow-primary/20"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-xs font-medium uppercase tracking-widest opacity-70">
                  {tr(lang, "jobStatus")}
                </h4>
                <p className="mt-1 truncate text-lg font-medium">
                  {job.status === "queued" && tr(lang, "queued")}
                  {job.status === "printing" && tr(lang, "printing")}
                  {job.status === "done" && tr(lang, "done")}
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {tr(lang, "token")}: {job.token}
              </div>
            </div>

            <div className="relative mb-3 flex items-center justify-between px-2">
              <div className="stepper-line absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2" />
              {(["queued", "printing", "done"] as JobStatus[]).map((step) => {
                const order = { queued: 0, printing: 1, done: 2 } as const;
                const active = order[job.status] >= order[step];
                return (
                  <div
                    key={step}
                    className={`relative z-10 size-4 rounded-full ring-4 ring-primary transition-colors ${
                      active ? "bg-accent" : "bg-primary-foreground/20"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider opacity-60">
              <span className={job.status !== "queued" ? "" : "text-accent"}>
                {tr(lang, "stepQueued")}
              </span>
              <span className={job.status === "printing" ? "text-accent" : ""}>
                {tr(lang, "stepPrinting")}
              </span>
              <span className={job.status === "done" ? "text-accent" : ""}>
                {tr(lang, "stepDone")}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm opacity-80">
                {tr(lang, "position")}: #{job.position}
              </span>
              {job.status === "queued" ? (
                <button
                  onClick={() => {
                    setJob(null);
                    pushToast("info", tr(lang, "cleared"));
                  }}
                  className="min-h-9 text-xs font-semibold underline decoration-accent underline-offset-4"
                >
                  {tr(lang, "cancelJob")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    clearAll();
                    setJob(null);
                  }}
                  className="min-h-9 text-xs font-semibold underline decoration-accent underline-offset-4"
                >
                  {tr(lang, "newJob")}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Shop staff link */}
        <div className="flex justify-center pt-4">
          <Link
            to="/shop"
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
          >
            <Store className="size-3.5" />
            {tr(lang, "shopLink")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {tr(lang, "estTotal")}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-primary">
                ₹{totals.cost.toFixed(2)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {files.length} · {totals.pages} pgs
              </p>
            </div>
          </div>
          <button
            onClick={() => submitJob(false)}
            disabled={files.length === 0}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />
            {tr(lang, "send")}
          </button>
        </div>
      </footer>

      {/* Let Shop Decide Modal */}
      {shopModal && (
        <Modal onClose={() => setShopModal(false)} labelledBy="privacy-title">
          <h3 id="privacy-title" className="mb-2 text-lg font-semibold">
            {tr(lang, "privacyTitle")}
          </h3>
          <p className="mb-6 text-pretty text-sm text-muted-foreground">
            {tr(lang, "privacyBody")}
          </p>
          <label className="mb-6 flex cursor-pointer items-start gap-3">
            <Checkbox checked={viewConsent} onChange={setViewConsent} />
            <span className="text-sm leading-snug">{tr(lang, "viewConsent")}</span>
          </label>

          {allowDownload && (
            <div className="mb-6 rounded-2xl border border-border bg-surface-muted/60 p-3 text-xs text-muted-foreground">
              <Check className="mr-1 inline size-3 text-success" />
              {tr(lang, "downloadConsent")}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShopModal(false)}
              className="min-h-11 flex-1 rounded-full bg-surface-muted py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
            >
              {tr(lang, "cancel")}
            </button>
            <button
              onClick={confirmShopDecide}
              disabled={!viewConsent}
              className="min-h-11 flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tr(lang, "continueBtn")}
            </button>
            <button
              onClick={() => setDownloadModal(true)}
              aria-label={tr(lang, "downloadPerm")}
              className={`grid size-11 shrink-0 place-items-center rounded-2xl ring-1 transition-colors ${
                allowDownload
                  ? "bg-accent text-accent-foreground ring-accent"
                  : "bg-surface-muted text-muted-foreground ring-border hover:text-foreground"
              }`}
            >
              <Download className="size-4" />
            </button>
          </div>
        </Modal>
      )}

      {/* Download permission sub-modal */}
      {downloadModal && (
        <Modal onClose={() => setDownloadModal(false)} labelledBy="dl-title">
          <h3 id="dl-title" className="mb-2 text-lg font-semibold">
            {tr(lang, "downloadPerm")}
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            {tr(lang, "downloadConsent")}
          </p>
          <label className="mb-6 flex cursor-pointer items-start gap-3">
            <Checkbox checked={downloadConsent} onChange={setDownloadConsent} />
            <span className="text-sm leading-snug">{tr(lang, "downloadConsent")}</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setDownloadModal(false)}
              className="min-h-11 flex-1 rounded-full bg-surface-muted py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border"
            >
              {tr(lang, "cancel")}
            </button>
            <button
              onClick={() => {
                setAllowDownload(downloadConsent);
                setDownloadModal(false);
              }}
              className="min-h-11 flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              {tr(lang, "save")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------- Components -------- */

function Modal({
  children,
  onClose,
  labelledBy,
}: {
  children: React.ReactNode;
  onClose: () => void;
  labelledBy?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-primary/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-pop w-full max-w-md rounded-[28px] bg-surface p-6 shadow-2xl ring-1 ring-border-strong"
      >
        {children}
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-surface"
      }`}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

function FileCard({
  file,
  lang,
  expanded,
  onToggle,
  onUpdate,
  onSettings,
  onRemove,
}: {
  file: PrintFile;
  lang: Lang;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, patch: Partial<PrintFile>) => void;
  onSettings: (id: string, patch: Partial<PrintFile["settings"]>) => void;
  onRemove: (id: string) => void;
}) {
  const { cost, pages } = costForFile(file);
  const img = isImage(file.ext);
  const pdf = isPdf(file.ext);

  return (
    <div
      id={`file-${file.id}`}
      className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border scroll-mt-20"
    >
      <div className="flex items-start gap-4 p-4">
        {/* Preview */}
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-muted outline outline-1 -outline-offset-1 outline-border">
          {img && file.previewUrl ? (
            <img
              src={file.previewUrl}
              alt=""
              style={{ transform: `rotate(${file.rotation}deg)` }}
              className="size-full object-cover transition-transform"
            />
          ) : pdf ? (
            <FileText className="size-7 text-muted-foreground" />
          ) : (
            <FileIcon className="size-7 text-muted-foreground" />
          )}
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            {file.ext}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBytes(file.size)} · ~{file.pages} pgs
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <button
              onClick={onToggle}
              aria-expanded={expanded}
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent/25 px-3 py-1.5 text-xs font-medium text-primary"
            >
              {tr(lang, "settings")}
              <ChevronDown
                className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            {img && (
              <>
                <button
                  onClick={() => onUpdate(file.id, { rotation: file.rotation - 90 })}
                  aria-label={tr(lang, "rotateLeft")}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  onClick={() => onUpdate(file.id, { rotation: file.rotation + 90 })}
                  aria-label={tr(lang, "rotateRight")}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <RotateCw className="size-4" />
                </button>
              </>
            )}
            <button
              onClick={() => onRemove(file.id)}
              aria-label={tr(lang, "remove")}
              className="ml-auto grid size-9 place-items-center rounded-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-border px-4 pb-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(lang, "copies")}>
              <div className="flex h-11 items-center overflow-hidden rounded-xl ring-1 ring-border">
                <button
                  aria-label="-"
                  onClick={() =>
                    onSettings(file.id, {
                      copies: Math.max(1, file.settings.copies - 1),
                    })
                  }
                  className="grid h-full flex-1 place-items-center hover:bg-surface-muted"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-10 text-center font-medium">{file.settings.copies}</span>
                <button
                  aria-label="+"
                  onClick={() =>
                    onSettings(file.id, {
                      copies: Math.min(99, file.settings.copies + 1),
                    })
                  }
                  className="grid h-full flex-1 place-items-center hover:bg-surface-muted"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </Field>
            <Field label={tr(lang, "pages")}>
              <input
                value={file.settings.pagesInput}
                onChange={(e) => onSettings(file.id, { pagesInput: e.target.value })}
                placeholder={tr(lang, "pagesHint")}
                inputMode="text"
                className="h-11 w-full rounded-xl bg-surface px-3 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>

          <Field label={tr(lang, "paperSize")}>
            <SegGroup
              value={file.settings.paper}
              onChange={(v) => onSettings(file.id, { paper: v as PaperSize })}
              options={[
                { v: "A4", l: "A4" },
                { v: "A3", l: "A3" },
                { v: "Letter", l: "Letter" },
                { v: "Legal", l: "Legal" },
              ]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(lang, "color")}>
              <SegGroup
                value={file.settings.color}
                onChange={(v) => onSettings(file.id, { color: v as ColorMode })}
                options={[
                  { v: "bw", l: tr(lang, "bw") },
                  { v: "color", l: tr(lang, "colorOpt") },
                ]}
              />
            </Field>
            <Field label={tr(lang, "orientation")}>
              <SegGroup
                value={file.settings.orientation}
                onChange={(v) => onSettings(file.id, { orientation: v as Orientation })}
                options={[
                  { v: "portrait", l: tr(lang, "portrait") },
                  { v: "landscape", l: tr(lang, "landscape") },
                ]}
              />
            </Field>
          </div>

          <Field label={tr(lang, "sides")}>
            <SegGroup
              value={file.settings.sides}
              onChange={(v) => onSettings(file.id, { sides: v as Sides })}
              options={[
                { v: "single", l: tr(lang, "single") },
                { v: "double", l: tr(lang, "double") },
              ]}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={file.settings.fit}
              onChange={(v) => onSettings(file.id, { fit: v })}
            />
            <span className="text-sm">{tr(lang, "fit")}</span>
          </label>

          <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 ring-1 ring-border">
            <span className="text-sm font-medium">{tr(lang, "estCost")}</span>
            <div className="text-right">
              <p className="font-semibold">₹{cost.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground">{pages} pgs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-tight text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function SegGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div className="flex h-11 overflow-hidden rounded-xl ring-1 ring-border">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            aria-pressed={active}
            className={`min-h-11 flex-1 px-2 text-xs font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
