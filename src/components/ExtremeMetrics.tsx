import { Banknote, Moon, Footprints, BookOpen, Globe2, Zap, Lock } from "lucide-react";
import { TikTokStats } from "@/lib/tiktokParser";
import { cn } from "@/lib/utils";

interface ExtremeMetricsProps {
  stats: TikTokStats;
  locked?: boolean;
}

const formatCZK = (n: number) =>
  new Intl.NumberFormat("cs-CZ").format(n) + " Kč";

const ExtremeMetrics = ({ stats, locked = false }: ExtremeMetricsProps) => {
  const items = [
    {
      icon: Banknote,
      label: "Mohl/a sis vydělat",
      value: formatCZK(stats.opportunityCostCZK),
      hint: "místo scrollování (150 Kč/h)",
    },
    {
      icon: Moon,
      label: "Noční sova",
      value: `${stats.nightOwlMinutes.toLocaleString()} min`,
      hint: `${stats.nightOwlPercent}% času mezi 00–05h`,
    },
    {
      icon: Footprints,
      label: "Maratonů místo toho",
      value: stats.marathonsTime.toFixed(1),
      hint: "by sis stihl/a uběhnout",
    },
    {
      icon: BookOpen,
      label: "Knih přečtených",
      value: stats.booksRead.toFixed(1),
      hint: "průměrná kniha = 8h",
    },
    {
      icon: Globe2,
      label: "Kolikrát kolem Země",
      value: stats.earthLaps.toFixed(3),
      hint: "kdybys místo toho běhal/a",
    },
  ];

  const dot = stats.dopamineRating;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <span className="tag-label">Premium · realita check</span>
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground tracking-tight">
          Co tě to opravdu stálo
        </h3>
      </div>

      {/* Dopamine rating — hero card */}
      <div className={cn(
        "relative rounded-2xl border border-foreground/15 bg-card/60 p-6 overflow-hidden",
        locked && "select-none"
      )}>
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-foreground/5 blur-3xl" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-foreground/70" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
              Dopamine rating
            </p>
          </div>
          <div className={cn("flex items-baseline gap-3", locked && "blur-md")}>
            <span className="text-3xl font-display font-black gradient-text">
              {dot.label}
            </span>
            <span className="text-xs text-muted-foreground">
              level {dot.level}/5
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= dot.level ? "bg-foreground/80" : "bg-foreground/10"
                )}
              />
            ))}
          </div>
          <p className={cn("text-xs text-muted-foreground italic", locked && "blur-md")}>
            „{dot.description}"
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            Průměrná délka session: <span className="text-foreground/80 font-semibold">{stats.averageSessionMin} min</span>
          </p>
        </div>
      </div>

      {/* Grid of equivalents */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border border-border/60 bg-card/40 p-4 space-y-2",
                locked && "select-none"
              )}
            >
              <Icon className="h-4 w-4 text-foreground/60" />
              <p className={cn("text-lg font-display font-bold text-foreground leading-tight", locked && "blur-md")}>
                {it.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-semibold">
                {it.label}
              </p>
              <p className={cn("text-[10px] text-muted-foreground/70", locked && "blur-sm")}>
                {it.hint}
              </p>
            </div>
          );
        })}
      </div>

      {locked && (
        <a
          href="https://buy.stripe.com/cNi14ndL1c4mgTNgvlebu00?utm=premium"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background py-3 text-sm font-display font-bold hover:opacity-90 transition"
        >
          <Lock className="h-4 w-4" />
          Odemknout Premium · 149 Kč
        </a>
      )}
    </div>
  );
};

export default ExtremeMetrics;
