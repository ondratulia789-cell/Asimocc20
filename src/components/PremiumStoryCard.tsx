import { useRef, useState } from "react";
import { Download, Share2, Sparkles } from "lucide-react";
import { TikTokStats } from "@/lib/tiktokParser";
import { cn } from "@/lib/utils";

interface PremiumStoryCardProps {
  stats: TikTokStats;
}

const themes = [
  { id: "noir", label: "Noir", bg: "linear-gradient(160deg, #0a0a0a 0%, #1a1a1a 60%, #0a0a0a 100%)", accent: "#ffffff" },
  { id: "ember", label: "Ember", bg: "linear-gradient(160deg, #0a0a0a 0%, #2b1410 55%, #0a0a0a 100%)", accent: "#ff7a59" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(160deg, #050818 0%, #0d1b3a 60%, #020410 100%)", accent: "#7cb1ff" },
];

const formatN = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);

const PremiumStoryCard = ({ stats }: PremiumStoryCardProps) => {
  const [theme, setTheme] = useState(themes[0]);
  const cardRef = useRef<HTMLDivElement>(null);

  const days = (stats.totalMinutes / 60 / 24).toFixed(1);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const clone = cardRef.current.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "1080px";
    clone.style.height = "1920px";
    clone.style.transform = "none";
    document.body.appendChild(clone);

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(clone, {
      width: 1080,
      height: 1920,
      scale: 1,
      useCORS: true,
      backgroundColor: null,
    });
    document.body.removeChild(clone);

    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) return;
    const file = new File([blob], "asimoc-story.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Moje TikTok statistiky", files: [file] });
        return;
      } catch {}
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "asimoc-story-9x16.png";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <span className="tag-label flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Premium · Stories 9:16
          </span>
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground tracking-tight">
          Premium karta na Stories
        </h3>
        <p className="text-xs text-muted-foreground">
          Bez watermarku. Připravené pro TikTok / Reels / Snapchat.
        </p>
      </div>

      {/* Theme switcher */}
      <div className="flex justify-center gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition",
              theme.id === t.id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 9:16 preview (scaled) */}
      <div className="mx-auto w-full max-w-[280px]">
        <div
          ref={cardRef}
          style={{ background: theme.bg, aspectRatio: "9/16" }}
          className="relative w-full overflow-hidden rounded-3xl text-white"
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-3xl"
            style={{ background: theme.accent }}
          />
          <div
            className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ background: theme.accent }}
          />

          <div className="relative h-full flex flex-col justify-between p-7">
            {/* Header */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">TikTok wrapped</p>
              <h2 className="text-3xl font-display font-black mt-1">Asimoc</h2>
            </div>

            {/* Hero number */}
            <div className="text-center space-y-2">
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">
                Celkem na TikToku
              </p>
              <p
                className="text-6xl font-display font-black leading-none"
                style={{
                  textShadow: `0 0 40px ${theme.accent}40`,
                }}
              >
                {formatN(stats.totalMinutes)}
              </p>
              <p className="text-sm opacity-80">minut · {days} dní</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xl font-display font-black">
                  {formatN(stats.totalVideos)}
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-60">videí</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xl font-display font-black">
                  {formatN(stats.opportunityCostCZK)}
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-60">Kč mimo</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xl font-display font-black">
                  {stats.nightOwlMinutes}
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-60">noční sova min</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xl font-display font-black">
                  {stats.marathonsTime.toFixed(1)}
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-60">maratonů</p>
              </div>
            </div>

            {/* Dopamine */}
            <div
              className="rounded-xl border p-3 text-center"
              style={{ borderColor: `${theme.accent}55`, background: `${theme.accent}10` }}
            >
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">Dopamine rating</p>
              <p className="text-base font-display font-bold mt-0.5">
                {stats.dopamineRating.label}
              </p>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-[10px] opacity-40 tracking-wider">asimoc.site</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-3 text-sm font-display font-bold hover:opacity-90 transition"
      >
        <Download className="h-4 w-4" />
        Stáhnout 1080×1920 PNG
      </button>
    </div>
  );
};

export default PremiumStoryCard;
