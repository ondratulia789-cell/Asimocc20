import { useState, useEffect } from "react";
import { Clock, Film, Timer } from "lucide-react";
import PricingTiers from "./PricingTiers";

interface LockedStatsProps {
  averageDaily: number;
  totalMinutes: number;
  totalVideos: number;
}

const LockedStats = ({ averageDaily, totalMinutes, totalVideos }: LockedStatsProps) => {
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-12">
      {/* FREE TIER reveal: total minutes + videos jako hook */}
      <div className="text-center space-y-3">
        <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-semibold">
          Tvůj náhled zdarma
        </p>
        <div className="space-y-1">
          <span className="block text-7xl sm:text-8xl font-display font-black gradient-text leading-none tracking-tighter">
            {totalMinutes.toLocaleString()}
          </span>
          <span className="block text-sm text-muted-foreground uppercase tracking-wide">
            minut na TikToku
          </span>
        </div>
        <p className="text-sm text-foreground/80">
          ...a <span className="font-display font-bold">{totalVideos.toLocaleString()}</span> videí.
        </p>
      </div>

      {/* Locked teaser */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: 'denní průměr', value: `${averageDaily.toFixed(0)} min`, blur: false },
          { icon: Film, label: 'rekordní den', value: '••••', blur: true },
          { icon: Timer, label: 'noční sova', value: '••••', blur: true },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-3 text-center space-y-1">
              <Icon className="w-3.5 h-3.5 mx-auto text-foreground/60" />
              <p className={`text-sm font-display font-bold text-foreground ${item.blur ? 'blur-sm select-none' : ''}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>

      {timeLeft > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
            ⏳ Speciální sleva vyprší za{" "}
            <span className="font-display font-bold text-foreground">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}

      <PricingTiers currentTier="free" />
    </div>
  );
};

export default LockedStats;
