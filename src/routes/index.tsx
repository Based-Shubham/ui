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
  ArrowRight,
  Languages,
} from "lucide-react";

const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "docx"];
const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const DEFAULT_SETTINGS = { copies: 1, pagesInput: "", paper: "A4", color: "bw", orientation: "portrait", sides: "single", fit: true };

// RESTORED: Self-contained translation dictionary to prevent the white-screen crash completely
const translations = {
  en: {
    title: "QuickPrint",
    subtitle: "Scan. Upload. Print.",
    dropzoneTitle: "Drop files here or click to browse",
    dropzoneSub: "Supports PDF, Documents, and Images up to 25MB.",
    selectFiles: "Select Files",
    addMore: "Add More Files",
    uploadingBatch: "Uploading Batch...",
    sendingServer: "Sending batch to server...",
    filesInQueue: "Files In Queue",
    noFilesYet: "No files uploaded yet",
    clearAll: "Clear All",
    customSettings: "Custom Settings",
    letShopDecide: "Let Shop Decide",
    jobStatus: "Job Status",
    token: "Token",
    queued: "Queued",
    printing: "Printing",
    ready: "Ready",
    position: "Queue Position",
    cancelJob: "Cancel Job",
    newOrder: "New Order",
    dashboard: "Shop Dashboard",
    estCost: "Estimated Cost",
    items: "Items",
    sendPrint: "Send to Print",
    privacyTitle: "Privacy Policy",
    privacyDesc: "Your files are securely transmitted directly to our shop storage system and deleted completely after processing.",
    consentLabel: "I consent to the vendor viewing my document contents to verify print layouts.",
    cancel: "Cancel",
    continue: "Continue",
    copies: "Copies",
    paperSize: "Paper Size",
    color: "Color",
    orientation: "Orientation",
    sides: "Sides",
    bw: "B&W",
    colorOpt: "Color",
    portrait: "Portrait",
    landscape: "Landscape",
    single: "Single",
    double: "Double",
    estFileCost: "Est. File Cost",
    settings: "Settings"
  },
  hi: {
    title: "क्विकप्रिंट",
    subtitle: "स्कैन। अपलोड। प्रिंट।",
    dropzoneTitle: "फाइलें यहां छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
    dropzoneSub: "25MB तक पीडीएफ, दस्तावेज़ और छवियों का समर्थन करता है।",
    selectFiles: "फाइलें चुनें",
    addMore: "और फाइलें जोड़ें",
    uploadingBatch: "बैच अपलोड हो रहा है...",
    sendingServer: "सर्वर पर बैच भेजा जा रहा है...",
    filesInQueue: "कतार में फाइलें",
    noFilesYet: "अभी तक कोई फाइल अपलोड नहीं हुई",
    clearAll: "सभी साफ करें",
    customSettings: "कस्टम सेटिंग्स",
    letShopDecide: "दुकानदार को तय करने दें",
    jobStatus: "काम की स्थिति",
    token: "टोकन",
    queued: "कतार में",
    printing: "प्रिंट हो रहा है",
    ready: "तैयार",
    position: "कतार की स्थिति",
    cancelJob: "काम रद्द करें",
    newOrder: "नया ऑर्डर",
    dashboard: "दुकान डैशबोर्ड",
    estCost: "अनुमानित लागत",
    items: "आइटम",
    sendPrint: "प्रिंट के लिए भेजें",
    privacyTitle: "गोपनीयता नीति",
    privacyDesc: "आपकी फाइलें सुरक्षित रूप से सीधे हमारे शॉप स्टोरेज सिस्टम में भेजी जाती हैं और प्रोसेसिंग के बाद पूरी तरह से डिलीट कर दी जाती हैं।",
    consentLabel: "मैं प्रिंट लेआउट को सत्यापित करने के लिए विक्रेता को मेरे दस्तावेज़ की सामग्री देखने की सहमति देता हूँ।",
    cancel: "रद्द करें",
    continue: "जारी रखें",
    copies: "प्रतियां",
    paperSize: "कागज का आकार",
    color: "रंग",
    orientation: "अभिविन्यास",
    sides: "पक्ष",
    bw: "ब्लैक एंड वाइट",
    colorOpt: "रंगीन",
    portrait: "पोर्ट्रेट",
    landscape: "लैंडस्केप",
    single: "एक तरफा",
    double: "दोनों तरफा",
    estFileCost: "अनुमानित फाइल लागत",
    settings: "सेटिंग्स"
  },
  mr: {
    title: "क्विकप्रिंट",
    subtitle: "स्कॅन. अपलोड. प्रिंट.",
    dropzoneTitle: "फायली येथे टाका किंवा ब्राउझ करण्यासाठी क्लिक करा",
    dropzoneSub: "25MB पर्यंत पीडीएफ, दस्तऐवज आणि प्रतिमांना समर्थन देते.",
    selectFiles: "फायली निवडा",
    addMore: "आणखी फायली जोडा",
    uploadingBatch: "बॅच अपलोड होत आहे...",
    sendingServer: "सर््हरवर बॅच पाठवत आहे...",
    filesInQueue: "रांगेत फायली",
    noFilesYet: "अजून फायली अपलोड केल्या नाहीत",
    clearAll: "सर्व साफ करा",
    customSettings: "कस्टम सेटिंग्ज",
    letShopDecide: "दुकानदाराला ठरवू द्या",
    jobStatus: "कामाची स्थिती",
    token: "टोकन",
    queued: "रांगेत",
    printing: "प्रिंट होत आहे",
    ready: "तयार",
    position: "रांगेतील स्थान",
    cancelJob: "काम रद्द करा",
    newOrder: "नवीन ऑर्डर",
    dashboard: "दुकान डॅशबोर्ड",
    estCost: "अंदाजे खर्च",
    items: "आयटम",
    sendPrint: "प्रिंटसाठी पाठवा",
    privacyTitle: "गोपनीयता धोरण",
    privacyDesc: "तुमच्या फायली आमच्या शॉप स्टोरेज सिस्टममध्ये सुरक्षितपणे पाठवल्या जातात आणि प्रक्रियेनंतर पूर्णपणे हटवल्या जातात.",
    consentLabel: "प्रिंट लेआउटची पडताळणी करण्यासाठी विक्रेत्याला माझ्या दस्तऐवजाची सामग्री पाहण्यास मी संमती देतो.",
    cancel: "रद्द करा",
    continue: "पुढील",
    copies: "प्रती",
    paperSize: "कागदाचा आकार",
    color: "रंग",
    orientation: "अभिमुखता",
    sides: "बाजू",
    bw: "ब्लॅक अँड व्हाईट",
    colorOpt: "रंगीत",
    portrait: "पोर्ट्रेट",
    landscape: "लँडस्केप",
    single: "एकतर्फी",
    double: "दुतर्फी",
    estFileCost: "अंदाजे फाईल खर्च",
    settings: "सेटिंग्ज"
  }
} as const;

type LangCode = "en" | "hi" | "mr";

type PrintFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  ext: string;
  pages: number;
  rotation: number;
  previewUrl?: string;
  settings: typeof DEFAULT_SETTINGS;
};

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

export default function QuickPrintPage() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<LangCode>("en"); // <-- RESTORED: Language tracking state
  const [files, setFiles] = useState<PrintFile[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shopModal, setShopModal] = useState(false);
  const [viewConsent, setViewConsent] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const jobRef = useRef<HTMLDivElement>(null);

  // Helper macro function to easily swap texts dynamically based on current language choice
  const t = (key: keyof typeof translations["en"]) => translations[lang][key] || translations["en"][key];

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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

  const pushToast = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5000);
  }, []);

  const handleFiles = useCallback((raw: FileList | File[]) => {
    const list = Array.from(raw);
    if (list.length === 0) return;

    setUploading(true);
    setUploadPct(0);

    const newUploadedFiles: PrintFile[] = [];
    let completedCount = 0;

    list.forEach((fileToUpload) => {
      const formData = new FormData();
      formData.append("file", fileToUpload);

      fetch("/", {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          completedCount++;
          if (response.ok) {
            const resultText = await response.text();
            
            let shortMessage = "Uploaded successfully!";
            if (resultText.includes("Job ID is:")) {
              const matches = resultText.match(/Job ID is:\s*(.*)/);
              if (matches && matches[1]) {
                if (matches[1].includes("'job_id':")) {
                  const idMatch = matches[1].match(/'job_id':\s*'([^']+)'/);
                  shortMessage = idMatch ? `File uploaded! Job ID: ${idMatch[1]}` : "File uploaded successfully!";
                } else {
                  shortMessage = `File uploaded! Job ID: ${matches[1]}`;
                }
              }
            }

            pushToast("success", `${fileToUpload.name}: ${shortMessage}`);
            
            newUploadedFiles.push({
              id: newId(),
              name: fileToUpload.name,
              size: fileToUpload.size,
              type: fileToUpload.type,
              ext: fileToUpload.name.split('.').pop()?.toLowerCase() || "",
              pages: 1,
              rotation: 0,
              settings: { ...DEFAULT_SETTINGS }
            });
          } else {
            pushToast("warning", `Failed to upload ${fileToUpload.name}`);
          }

          if (completedCount === list.length) {
            setUploading(false);
            if (newUploadedFiles.length > 0) {
              setFiles((prev) => [...prev, ...newUploadedFiles]);
            }
          }
        })
        .catch((error) => {
          completedCount++;
          pushToast("warning", `Network connection error on ${fileToUpload.name}`);
          console.error(error);
          if (completedCount === list.length) {
            setUploading(false);
          }
        });
    });
  }, [pushToast]);

  const onPick = () => inputRef.current?.click();

  const updateFile = (id: string, patch: Partial<PrintFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };
  const updateSettings = (id: string, patch: Partial<PrintFile["settings"]>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...patch } } : f)));
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
    pushToast("success", "Cleared all selections.");
  };

  const totals = useMemo(() => {
    let totalCost = 0;
    let totalPages = 0;
    for (const f of files) {
      const copies = f.settings.copies || 1;
      const isColor = f.settings.color === "color";
      const pricePerPage = isColor ? 10 : 2; 
      
      totalCost += pricePerPage * copies;
      totalPages += copies;
    }
    return { cost: totalCost, pages: totalPages };
  }, [files]);

  const submitJob = (letShopDecide: boolean) => {
    if (files.length === 0) {
      pushToast("warning", "Please select files first.");
      return;
    }
    const token = String(Math.floor(100 + Math.random() * 900));
    const position = Math.floor(1 + Math.random() * 5);
    setJob({ token, position, status: "queued", letShopDecide });
    pushToast("success", "Job submitted successfully!");
    setTimeout(() => {
      jobRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openCustom = () => {
    if (files.length === 0) {
      pushToast("warning", "No files selected.");
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
      pushToast("warning", "No files selected.");
      return;
    }
    setViewConsent(false);
    setShopModal(true);
  };

  const confirmShopDecide = () => {
    if (!viewConsent) return;
    setShopModal(false);
    submitJob(true);
  };

  return (
    <div className="relative min-h-dvh bg-background text-foreground curved-motif pb-40">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-accent/40 opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full border border-earth/20 opacity-50" />

      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[560px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div aria-label="QuickPrint logo" className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-border-strong bg-primary font-semibold tracking-tight text-primary-foreground shadow-sm">
              QP
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-none">{t("title")}</h1>
              <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* RESTORED: Standard inline dynamic translation selector layout block item switches */}
            <div className="flex items-center gap-1 rounded-full bg-surface-muted p-0.5 ring-1 ring-border">
              {(["en", "hi", "mr"] as LangCode[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : "मरा"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle Theme"
              className="grid size-9 place-items-center rounded-full bg-surface-muted ring-1 ring-border text-foreground transition-colors hover:bg-surface"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto flex max-w-[560px] flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-enter pointer-events-auto flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${
              t.kind === "success" ? "border-success/30 bg-success/10 text-foreground" : t.kind === "warning" ? "border-warning/40 bg-warning/15 text-foreground" : "border-border bg-surface text-foreground"
            }`}
          >
            {t.kind === "success" && <CheckCircle2 className="size-4 text-success" />}
            {t.kind === "warning" && <AlertTriangle className="size-4 text-warning" />}
            {t.kind === "info" && <Loader2 className="size-4 animate-spin" />}
            <span className="leading-tight text-xs font-mono break-all">{t.text}</span>
          </div>
        ))}
      </div>

      <main className="mx-auto max-w-[560px] space-y-8 px-4 py-8">
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
            <h2 id="upload-heading" className="text-balance text-lg font-semibold">{t("dropzoneTitle")}</h2>
            <p className="mt-1 max-w-[36ch] text-pretty text-sm text-muted-foreground">{t("dropzoneSub")}</p>
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
                  {t("uploadingBatch")}
                </>
              ) : files.length === 0 ? (
                t("selectFiles")
              ) : (
                t("addMore")
              )}
            </button>

            {uploading && (
              <div className="mt-5 w-full max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-primary " style={{ width: `100%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t("sendingServer")}</p>
              </div>
            )}
          </div>
        </section>

        <section ref={fileListRef} aria-labelledby="files-heading" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between px-1">
            <h3 id="files-heading" className="text-sm font-medium text-muted-foreground">
              {files.length} {t("filesInQueue")}
            </h3>
            {files.length > 0 && (
              <button onClick={clearAll} className="min-h-9 text-sm font-medium text-earth transition-opacity hover:opacity-80">
                {t("clearAll")}
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-10 text-center">
              <FileText className="mx-auto mb-3 size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{t("noFilesYet")}</p>
            </div>
          ) : (
            files.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                expanded={expanded.has(f.id)}
                langLabels={{
                  copies: t("copies"),
                  paperSize: t("paperSize"),
                  color: t("color"),
                  orientation: t("orientation"),
                  sides: t("sides"),
                  bw: t("bw"),
                  colorOpt: t("colorOpt"),
                  portrait: t("portrait"),
                  landscape: t("landscape"),
                  single: t("single"),
                  double: t("double"),
                  estFileCost: t("estFileCost"),
                  settings: t("settings")
                }}
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

        <section className="grid grid-cols-2 gap-3">
          <button onClick={openCustom} className="min-h-12 rounded-2xl bg-surface px-4 py-3 text-sm font-medium ring-1 ring-border transition-colors hover:bg-surface-muted">
            {t("customSettings")}
          </button>
          <button onClick={openShopModal} className="min-h-12 rounded-2xl bg-surface px-4 py-3 text-sm font-medium ring-1 ring-border transition-colors hover:bg-surface-muted">
            {t("letShopDecide")}
          </button>
        </section>

        {job && (
          <section ref={jobRef} aria-live="polite" className="scroll-mt-20 rounded-3xl bg-primary p-5 text-primary-foreground shadow-xl shadow-primary/20">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-xs font-medium uppercase tracking-widest opacity-70">{t("jobStatus")}</h4>
                <p className="mt-1 truncate text-lg font-medium">
                  {job.status === "queued" && t("queued")}
                  {job.status === "printing" && t("printing")}
                  {job.status === "done" && t("ready")}
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {t("token")}: {job.token}
              </div>
            </div>

            <div className="relative mb-3 flex items-center justify-between px-2">
              <div className="stepper-line absolute inset-x-0 top-1/2 -z-0 h-px -translate-y-1/2" />
              {(["queued", "printing", "done"] as JobStatus[]).map((step) => {
                const order = { queued: 0, printing: 1, done: 2 } as const;
                const active = order[job.status] >= order[step];
                return (
                  <div key={step} className={`relative z-10 size-4 rounded-full ring-4 ring-primary transition-colors ${active ? "bg-accent" : "bg-primary-foreground/20"}`} />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider opacity-60">
              <span className={job.status !== "queued" ? "" : "text-accent"}>{t("queued")}</span>
              <span className={job.status === "printing" ? "text-accent" : ""}>{t("printing")}</span>
              <span className={job.status === "done" ? "text-accent" : ""}>{t("ready")}</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm opacity-80">{t("position")}: #{job.position}</span>
              {job.status === "queued" ? (
                <button onClick={() => { setJob(null); pushToast("info", "Job cancelled."); }} className="min-h-9 text-xs font-semibold underline decoration-accent underline-offset-4">
                  {t("cancelJob")}
                </button>
              ) : (
                <button onClick={() => { clearAll(); setJob(null); }} className="min-h-9 text-xs font-semibold underline decoration-accent underline-offset-4">
                  {t("newOrder")}
                </button>
              )}
            </div>
          </section>
        )}

        <div className="flex justify-center pt-4">
          <button className="inline-flex min-h-9 items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground">
            <Store className="size-3.5" />
            {t("dashboard")}
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("estCost")}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-primary">₹{totals.cost.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground">{files.length} {t("items")}</p>
            </div>
          </div>
          <button onClick={() => submitJob(false)} disabled={files.length === 0} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="size-4" />
            {t("sendPrint")}
          </button>
        </div>
      </footer>

      {shopModal && (
        <Modal onClose={() => setShopModal(false)} labelledBy="privacy-title">
          <h3 id="privacy-title" className="mb-2 text-lg font-semibold">{t("privacyTitle")}</h3>
          <p className="mb-6 text-pretty text-sm text-muted-foreground">{t("privacyDesc")}</p>
          <label className="mb-6 flex cursor-pointer items-start gap-3">
            <Checkbox checked={viewConsent} onChange={setViewConsent} />
            <span className="text-sm leading-snug">{t("consentLabel")}</span>
          </label>

          <div className="flex items-center gap-3">
            <button onClick={() => setShopModal(false)} className="min-h-11 flex-1 rounded-full bg-surface-muted py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground">
              {t("cancel")}
            </button>
            <button onClick={confirmShopDecide} disabled={!viewConsent} className="min-h-11 flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40">
              {t("continue")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, labelledBy }: { children: React.ReactNode; onClose: () => void; labelledBy?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="fixed inset-0 z-[100] flex items-end justify-center bg-primary/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="modal-pop w-full max-w-md rounded-[28px] bg-surface p-6 shadow-2xl ring-1 ring-border-strong">
        {children}
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-surface"}`}>
      {checked && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

function FileCard({ file, expanded, langLabels, onToggle, onUpdate, onSettings, onRemove }: { file: PrintFile; expanded: boolean; langLabels: Record<string, string>; onToggle: () => void; onUpdate: (id: string, patch: Partial<PrintFile>) => void; onSettings: (id: string, patch: Partial<PrintFile["settings"]>) => void; onRemove: (id: string) => void }) {
  const img = ["jpg", "jpeg", "png"].includes(file.ext);
  
  const fileCost = useMemo(() => {
    const isColor = file.settings.color === "color";
    return (isColor ? 10 : 2) * (file.settings.copies || 1);
  }, [file.settings.color, file.settings.copies]);

  return (
    <div id={`file-${file.id}`} className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border scroll-mt-20">
      <div className="flex items-start gap-4 p-4">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface-muted outline outline-1 -outline-offset-1 outline-border">
          {img && file.previewUrl ? (
            <img src={file.previewUrl} alt="" style={{ transform: `rotate(${file.rotation}deg)` }} className="size-full object-cover transition-transform" />
          ) : (
            <FileText className="size-7 text-muted-foreground" />
          )}
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">{file.ext}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">~{file.settings.copies} {langLabels.copies.toLowerCase()}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <button onClick={onToggle} aria-expanded={expanded} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent/25 px-3 py-1.5 text-xs font-medium text-primary">
              {langLabels.settings}
              <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {img && (
              <>
                <button onClick={() => onUpdate(file.id, { rotation: file.rotation - 90 })} aria-label="Rotate Left" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                  <RotateCcw className="size-4" />
                </button>
                <button onClick={() => onUpdate(file.id, { rotation: file.rotation + 90 })} aria-label="Rotate Right" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                  <RotateCw className="size-4" />
                </button>
              </>
            )}
            <button onClick={() => onRemove(file.id)} aria-label="Remove" className="ml-auto grid size-9 place-items-center rounded-full text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t border-border px-4 pb-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={langLabels.copies}>
              <div className="flex h-11 items-center overflow-hidden rounded-xl ring-1 ring-border">
                <button aria-label="-" onClick={() => onSettings(file.id, { copies: Math.max(1, file.settings.copies - 1) })} className="grid h-full flex-1 place-items-center hover:bg-surface-muted">
                  <Minus className="size-4" />
                </button>
                <span className="min-w-10 text-center font-medium">{file.settings.copies}</span>
                <button aria-label="+" onClick={() => onSettings(file.id, { copies: Math.min(99, file.settings.copies + 1) })} className="grid h-full flex-1 place-items-center hover:bg-surface-muted">
                  <Plus className="size-4" />
                </button>
              </div>
            </Field>
          </div>

          <Field label={langLabels.paperSize}>
            <SegGroup value={file.settings.paper} onChange={(v) => onSettings(file.id, { paper: v })} options={[{ v: "A4", l: "A4" }, { v: "A3", l: "A3" }]} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={langLabels.color}>
              <SegGroup value={file.settings.color} onChange={(v) => onSettings(file.id, { color: v })} options={[{ v: "bw", l: langLabels.bw }, { v: "color", l: langLabels.colorOpt }]} />
            </Field>
            <Field label={langLabels.orientation}>
              <SegGroup value={file.settings.orientation} onChange={(v) => onSettings(file.id, { orientation: v })} options={[{ v: "portrait", l: langLabels.portrait }, { v: "landscape", l: langLabels.landscape }]} />
            </Field>
          </div>

          <Field label={langLabels.sides}>
            <SegGroup value={file.settings.sides} onChange={(v) => onSettings(file.id, { sides: v })} options={[{ v: "single", l: langLabels.single }, { v: "double", l: langLabels.double }]} />
          </Field>

          <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 ring-1 ring-border">
            <span className="text-sm font-medium">{langLabels.estFileCost}</span>
            <div className="text-right">
              <p className="font-semibold">₹{fileCost.toFixed(2)}</p>
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
      <label className="text-[11px] font-semibold uppercase tracking-tight text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function SegGroup<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="flex h-11 overflow-hidden rounded-xl ring-1 ring-border">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={active} className={`min-h-11 flex-1 px-2 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-surface-muted"}`}>
            {o.l}
          </button>
        );
      })}
    </div>
  );
}