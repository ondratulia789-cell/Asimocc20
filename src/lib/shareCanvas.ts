// Kreslení sdílecích karet přímo do <canvas>.
// Dříve se používal html2canvas, který neumí barvy oklab/oklch z Tailwindu v4
// a export tiše padal. Vlastní kreslení navíc dává přesné rozměry (1080×1080, 1080×1920).

import type { TikTokStats } from "@/lib/tiktokParser";

const DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const BODY = "'Inter', sans-serif";
const MUTED = "rgb(140, 140, 140)"; // --muted-foreground (0 0% 55 %)

const formatCs = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);

async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    [
      `400 16px ${BODY}`,
      `700 16px ${BODY}`,
      `700 16px ${DISPLAY}`,
      `900 16px ${BODY}`,
    ].map((f) => document.fonts.load(f).catch(() => undefined)),
  );
  await document.fonts.ready;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D není dostupný");
  return { canvas, ctx };
}

/** CSS-like linear-gradient(angle) přes obdélník w×h. */
function cssLinearGradient(
  ctx: CanvasRenderingContext2D,
  angleDeg: number,
  w: number,
  h: number,
  stops: [number, string][],
) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  const g = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
  for (const [offset, color] of stops) g.addColorStop(offset, color);
  return g;
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${px}px`;
}

/** Vykreslí text na střed; když je moc široký, zmenší písmo. */
function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { size: number; weight?: number; family?: string; color: string; maxWidth?: number; spacing?: number },
) {
  const { weight = 400, family = BODY, color, maxWidth, spacing = 0 } = opts;
  let size = opts.size;
  setSpacing(ctx, spacing);
  setFont(ctx, weight, size, family);
  if (maxWidth) {
    while (ctx.measureText(text).width > maxWidth && size > 6) {
      size -= 1;
      setFont(ctx, weight, size, family);
    }
  }
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  setSpacing(ctx, 0);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export obrázku selhal"))), "image/png"),
  );
}

// ───────────────────────── Čtvercová karta (Standard) ─────────────────────────

export interface SquareCardData {
  totalMinutes: number;
  totalVideos: number;
  longestSession: number;
  averageDaily: number;
  viaColor: string;
}

export async function renderSquareCard(d: SquareCardData): Promise<Blob> {
  await ensureFonts();
  const W = 360; // návrhové jednotky, výstup 1080 px
  const { canvas, ctx } = createCanvas(1080, 1080);
  ctx.scale(3, 3);

  ctx.fillStyle = cssLinearGradient(ctx, 135, W, W, [
    [0, "#000000"],
    [0.5, d.viaColor],
    [1, "#000000"],
  ]);
  ctx.fillRect(0, 0, W, W);

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;

  drawCentered(ctx, "Asi Moc", W / 2, 46, { size: 24, weight: 700, color: "#ededed" });
  drawCentered(ctx, "TikTok statistiky", W / 2, 74, { size: 12, color: MUTED });
  drawCentered(ctx, "Za celou dobu", W / 2, 96, { size: 11, color: "rgba(140,140,140,0.6)" });

  drawCentered(ctx, formatCs(d.totalMinutes), W / 2, 162, {
    size: 60,
    weight: 700,
    color: "#ffffff",
    maxWidth: W - 64,
  });
  drawCentered(ctx, "minut na TikToku", W / 2, 202, { size: 18, color: MUTED });
  drawCentered(ctx, `(${(d.totalMinutes / 60 / 24).toFixed(1)} dní)`, W / 2, 224, {
    size: 14,
    color: "rgba(140,140,140,0.6)",
  });

  const colW = (W - 64) / 3;
  const cols: [string, string][] = [
    [formatCs(d.totalVideos), "videí"],
    [`${Math.round(d.longestSession)} min`, "session"],
    [`${d.averageDaily.toFixed(0)} min`, "denně"],
  ];
  cols.forEach(([value, label], i) => {
    const x = 32 + colW * i + colW / 2;
    drawCentered(ctx, value, x, 268, { size: 20, weight: 700, color: "#ffffff", maxWidth: colW - 6 });
    drawCentered(ctx, label, x, 290, { size: 12, color: MUTED });
  });

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(61,61,61,0.6)";
  ctx.fillRect(32, 310, W - 64, 1);
  drawCentered(ctx, "asimoc.site", W / 2, 332, { size: 12, color: "rgba(140,140,140,0.6)" });

  return toBlob(canvas);
}

// ───────────────────────── Story karta 9:16 (Premium) ─────────────────────────

export interface StoryTheme {
  bg: [number, string][];
  accent: string;
}

export async function renderStoryCard(stats: TikTokStats, theme: StoryTheme): Promise<Blob> {
  await ensureFonts();
  const W = 280; // návrhová šířka náhledu, výstup 1080×1920
  const H = (W * 16) / 9;
  const s = 1080 / W;
  const { canvas, ctx } = createCanvas(1080, 1920);
  ctx.scale(s, s);

  // Pozadí
  ctx.fillStyle = cssLinearGradient(ctx, 160, W, H, theme.bg);
  ctx.fillRect(0, 0, W, H);

  // Rozmazané "bloby" jako radiální přechody
  const blob = (cx: number, cy: number, r: number, alpha: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, hexWithAlpha(theme.accent, alpha));
    g.addColorStop(1, hexWithAlpha(theme.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  blob(W - 48, 48, 170, 0.3);
  blob(80, H - 32, 210, 0.2);

  const P = 28;
  const white = (a: number) => `rgba(255,255,255,${a})`;

  // Hlavička
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, 3);
  setFont(ctx, 400, 10, BODY);
  ctx.fillStyle = white(0.6);
  ctx.fillText("TIKTOK WRAPPED", P, P + 9);
  setSpacing(ctx, 0);
  setFont(ctx, 900, 30, DISPLAY);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Asimoc", P, P + 46);

  // Hlavní číslo
  drawCentered(ctx, "CELKEM NA TIKTOKU", W / 2, 120, { size: 10, color: white(0.6), spacing: 2.5 });
  ctx.shadowColor = hexWithAlpha(theme.accent, 0.25);
  ctx.shadowBlur = 40;
  drawCentered(ctx, formatCs(stats.totalMinutes), W / 2, 162, {
    size: 60,
    weight: 900,
    family: DISPLAY,
    color: "#ffffff",
    maxWidth: W - 2 * P,
  });
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  drawCentered(ctx, `minut · ${(stats.totalMinutes / 60 / 24).toFixed(1)} dní`, W / 2, 202, {
    size: 14,
    color: white(0.8),
  });

  // Mřížka 2×2
  const gap = 10;
  const cellW = (W - 2 * P - gap) / 2;
  const cellH = 56;
  const gridTop = 236;
  const cells: [string, string][] = [
    [formatCs(stats.totalVideos), "VIDEÍ"],
    [formatCs(stats.opportunityCostCZK), "KČ UŠLÝ VÝDĚLEK"],
    [formatCs(stats.nightOwlMinutes), "MIN V NOCI (0–5 H)"],
    [stats.marathonsTime.toFixed(1), "MARATONŮ"],
  ];
  cells.forEach(([value, label], i) => {
    const x = P + (i % 2) * (cellW + gap);
    const y = gridTop + Math.floor(i / 2) * (cellH + gap);
    roundRect(ctx, x, y, cellW, cellH, 12);
    ctx.fillStyle = white(0.05);
    ctx.fill();
    ctx.strokeStyle = white(0.1);
    ctx.lineWidth = 1;
    ctx.stroke();
    drawCentered(ctx, value, x + cellW / 2, y + 23, {
      size: 20,
      weight: 900,
      family: DISPLAY,
      color: "#ffffff",
      maxWidth: cellW - 12,
    });
    drawCentered(ctx, label, x + cellW / 2, y + 42, {
      size: 8,
      color: white(0.6),
      spacing: 0.8,
      maxWidth: cellW - 8,
    });
  });

  // Dopamine rating
  const dTop = gridTop + 2 * cellH + gap + 26;
  roundRect(ctx, P, dTop, W - 2 * P, 52, 12);
  ctx.fillStyle = hexWithAlpha(theme.accent, 0.06);
  ctx.fill();
  ctx.strokeStyle = hexWithAlpha(theme.accent, 0.33);
  ctx.stroke();
  drawCentered(ctx, "DOPAMINE RATING", W / 2, dTop + 17, { size: 9, color: white(0.6), spacing: 1.8 });
  drawCentered(ctx, stats.dopamineRating.label, W / 2, dTop + 35, {
    size: 16,
    weight: 700,
    family: DISPLAY,
    color: "#ffffff",
    maxWidth: W - 2 * P - 16,
  });

  drawCentered(ctx, "asimoc.site", W / 2, H - P - 4, { size: 10, color: white(0.4), spacing: 1 });

  return toBlob(canvas);
}

function hexWithAlpha(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ───────────────────────── Sdílení / stažení ─────────────────────────

export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: "Moje TikTok statistiky", files: [file] });
      return;
    } catch (e) {
      // Uživatel sdílení zrušil → nic dalšího nedělat.
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revokace až po chvíli – okamžitá revokace rozbije stažení v Safari/Firefoxu.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
