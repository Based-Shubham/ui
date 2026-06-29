// QuickPrint pricing + file helpers
export const PRICE_BW = 2;
export const PRICE_COLOR = 10;
export const PRICE_A3_EXTRA = 1;

export const ALLOWED_EXT = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "txt",
];
export const MAX_BYTES = 50 * 1024 * 1024;

export type PaperSize = "A4" | "A3" | "Letter" | "Legal";
export type ColorMode = "bw" | "color";
export type Orientation = "portrait" | "landscape";
export type Sides = "single" | "double";

export type FileSettings = {
  copies: number;
  pagesInput: string; // free text like "1-3"
  paper: PaperSize;
  color: ColorMode;
  orientation: Orientation;
  sides: Sides;
  fit: boolean;
};

export type PrintFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  ext: string;
  pages: number; // estimated
  rotation: number;
  previewUrl?: string;
  settings: FileSettings;
};

export const DEFAULT_SETTINGS: FileSettings = {
  copies: 1,
  pagesInput: "",
  paper: "A4",
  color: "bw",
  orientation: "portrait",
  sides: "single",
  fit: true,
};

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function isImage(ext: string) {
  return ["jpg", "jpeg", "png", "webp"].includes(ext);
}

export function isPdf(ext: string) {
  return ext === "pdf";
}

export function estimatePages(file: File, ext: string): number {
  if (isImage(ext)) return 1;
  if (isPdf(ext)) {
    return Math.max(1, Math.round(file.size / 350_000));
  }
  return Math.max(1, Math.round(file.size / 50_000));
}

export function parsePagesSpec(spec: string, total: number): number {
  const s = spec.trim();
  if (!s) return total;
  let count = 0;
  for (const part of s.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((x) => parseInt(x, 10));
      if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
        count += Math.min(b, total) - Math.max(1, a) + 1;
      }
    } else {
      const n = parseInt(p, 10);
      if (Number.isFinite(n) && n >= 1 && n <= total) count += 1;
    }
  }
  return count > 0 ? count : total;
}

export function costForFile(f: PrintFile): { pages: number; cost: number } {
  const pages = parsePagesSpec(f.settings.pagesInput, f.pages);
  const perPage =
    (f.settings.color === "color" ? PRICE_COLOR : PRICE_BW) +
    (f.settings.paper === "A3" ? PRICE_A3_EXTRA : 0);
  const raw = pages * perPage * f.settings.copies;
  return { pages: pages * f.settings.copies, cost: Math.max(1, Math.ceil(raw)) };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
