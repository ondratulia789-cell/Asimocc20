import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { TikTokStats } from "@/lib/tiktokParser";
import { cn } from "@/lib/utils";
import { renderStoryCard, shareOrDownload } from "@/lib/shareCanvas";
import { toast } from "@/hooks/use-toast";

interface PremiumStoryCardProps {
  stats: TikTokStats;
}

const themes: { id: string; label: string; stops: [number, string][]; accent: string }[] = [
  { id: "noir", label: "Noir", stops: [[0, "#0a0a0a"], [0.6, "#1a1a1a"], [1, "#0a0a0a"]], accent: "#ffffff" },
  { id: "ember", label: "Ember", stops: [[0, "#0a0a0a"], [0.55, "#2b1410"], [1, "#0a0a0a"]], accent: "#ff7a59" },
  { id: "ocean", label: "Ocean", stops: [[0, "#050818"], [0.6, "#0d1b3a"], [1, "#020410"]], accent: "#7cb1ff" },
];

const cssGradient = (stops: [number, string][]) =>
  `linear-gradient(160deg, ${stops.map(([o, c]) => `${c} ${o * 100}%`).join(", ")})`;

const formatN = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);

const PremiumStoryCard = ({ stats }: PremiumStoryCardProps) => {
  const [theme, setTheme] = useState(themes[0]);

  const days = (stats.totalMinutes / 60 / 24).toFixed(1);

  const [isExporting, setIsExporting] = useState(false);

  // Export se kreslí přímo do canvasu v plném rozlišení 1080×1920
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await renderStoryCard(stats, { bg: theme.stops, accent: theme.accent });
      await shareOrDownload(blob, "asimoc-story-9x16.png");
    } catch (e) {
      console.error("[Asimoc] Story export failed:", e);
      toast({
        title: "Obrázek se nepodařilo vytvořit",
        description: "Zkus to prosím znovu.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
          Ve vysokém rozlišení. Připravené pro TikTok / Reels / Snapchat.
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
          style={{ background: cssGradient(theme.stops), aspectRatio: "9/16" }}
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
                <p className="text-[9px] uppercase tracking-wider opacity-60">Kč ušlý výdělek</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xl font-display font-black">
                  {formatN(stats.nightOwlMinutes)}
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-60">min v noci (0–5 h)</p>
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
        disabled={isExporting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl btn-brand py-3 text-sm font-display font-bold disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Připravuji obrázek…" : "Stáhnout 1080×1920 PNG"}
      </button>
    </div>
  );
};

export default PremiumStoryCard;
